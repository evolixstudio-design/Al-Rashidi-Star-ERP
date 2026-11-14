import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { WhatsAppService } from './whatsapp.service.js';

describe('invoice image and reminder sending', () => {
  let invoice: any;
  let repository: any;
  let audit: any;
  let web: any;
  let service: WhatsAppService;
  let file: any;
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(async () => {
    invoice = { id: 12, invoiceNumber: 'INV-TEST', status: 'POSTED', invoiceDate: '2026-11-14',
      customer: { name: 'Test customer', phone: '99887766' }, totalAmountKd: 27,
      amountReceivedKd: 10, outstandingKd: 17, paymentStatus: 'PARTIAL' };
    repository = { findOne: vi.fn(async () => invoice) };
    audit = { log: vi.fn().mockResolvedValue({}) };
    web = { isEnabled: () => true, getStatus: () => ({ ready: true }),
      sendImage: vi.fn().mockResolvedValue('message-123') };
    service = new WhatsAppService(repository, audit, { get: (_: string, fallback: any) => fallback } as any, web);
    const buffer = await sharp({ create: { width: 794, height: 1123, channels: 3, background: '#fff' } }).jpeg().toBuffer();
    file = { buffer, size: buffer.length, mimetype: 'image/jpeg' };
  });

  it('sends one image carrying the reminder caption to the invoice customer and audits it', async () => {
    const result = await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    expect(result).toMatchObject({ success: true, mode: 'WEB', messageId: 'message-123' });
    expect(web.sendImage).toHaveBeenCalledOnce();
    const [phone, buffer, filename, caption] = web.sendImage.mock.calls[0];
    expect(phone).toBe('96599887766');
    expect(buffer).toEqual(file.buffer);
    expect(filename).toBe('Rashidi-Star-INV-TEST.jpg');
    expect(caption).toContain('Invoice No: INV-TEST');
    expect(caption).toContain('Pending Amount: 17.000 K.D.');
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'WHATSAPP_INVOICE_IMAGE_SENT', performedBy: 'tester',
      details: expect.objectContaining({ messageId: 'message-123', messageType: 'PARTIAL_REMINDER' }),
    }));
  });

  it('suppresses a second click for the same invoice and payment state', async () => {
    await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    expect(web.sendImage).toHaveBeenCalledOnce();
  });

  it.each(['cancelled', 'paid reminder', 'bad phone', 'fake jpeg'])('rejects %s without sending', async (reason) => {
    if (reason === 'cancelled') invoice.status = 'CANCELLED';
    if (reason === 'paid reminder') invoice.outstandingKd = 0;
    if (reason === 'bad phone') invoice.customer.phone = '123';
    if (reason === 'fake jpeg') file.buffer = Buffer.alloc(file.size);
    await expect(service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester')).rejects.toThrow();
    expect(web.sendImage).not.toHaveBeenCalled();
  });

  it('does not claim success or silently fall back to text when WhatsApp is disconnected', async () => {
    web.sendImage.mockRejectedValue(new Error('Link WhatsApp in Settings first.'));
    const result = await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    expect(result).toMatchObject({ success: false, error: 'Link WhatsApp in Settings first.' });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'WHATSAPP_IMAGE_SEND_FAILED' }));
  });

  it.each(['FULL_PAYMENT_RECEIPT', 'PARTIAL_PAYMENT_RECEIPT', 'PENDING_REMINDER'] as const)('builds an accurate %s caption', async (type) => {
    if (type === 'FULL_PAYMENT_RECEIPT') { invoice.amountReceivedKd = 27; invoice.outstandingKd = 0; }
    if (type === 'PENDING_REMINDER') { invoice.amountReceivedKd = 0; invoice.outstandingKd = 27; invoice.dueDate = '2026-12-01'; }
    expect((await service.sendInvoiceImage(12, type, file, 'tester')).success).toBe(true);
    const caption = web.sendImage.mock.calls[0][3];
    expect(caption).toContain('27.000 K.D.');
    expect(caption).not.toMatch(/undefined|NaN/);
    if (type === 'PENDING_REMINDER') expect(caption).toContain('Due Date: 2026-12-01');
  });

  it('preserves the confirmed send when audit storage is unavailable', async () => {
    audit.log.mockRejectedValue(new Error('Audit temporarily unavailable'));
    expect((await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester')).success).toBe(true);
    await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    expect(web.sendImage).toHaveBeenCalledOnce();
  });

  it('blocks concurrent requests but allows a new reminder after a payment changes', async () => {
    let finish!: (id: string) => void;
    web.sendImage.mockImplementationOnce(() => new Promise<string>((resolve) => { finish = resolve; }));
    const first = service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    await vi.waitFor(() => expect(web.sendImage).toHaveBeenCalledOnce());
    await expect(service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester')).rejects.toThrow('already being sent');
    finish('first-send');
    await first;
    invoice.amountReceivedKd = 12;
    invoice.outstandingKd = 15;
    await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    expect(web.sendImage).toHaveBeenCalledTimes(2);
    expect(web.sendImage.mock.calls[1][3]).toContain('15.000 K.D.');
  });

  it.each(['missing', 'mime', 'large', 'small', 'invoice missing', 'phone missing', 'unpaid receipt'])('rejects %s input', async (reason) => {
    if (reason === 'missing') file = null;
    if (reason === 'mime') file.mimetype = 'text/html';
    if (reason === 'large') file.size = 6 * 1024 * 1024;
    if (reason === 'small') file.size = 50;
    if (reason === 'invoice missing') repository.findOne.mockResolvedValue(null);
    if (reason === 'phone missing') invoice.customer.phone = '';
    await expect(service.sendInvoiceImage(12, reason === 'unpaid receipt' ? 'FULL_PAYMENT_RECEIPT' : 'PARTIAL_REMINDER', file, 'tester')).rejects.toThrow();
    expect(web.sendImage).not.toHaveBeenCalled();
  });

  it('keeps the existing Cloud API path sending one image with a caption', async () => {
    web.isEnabled = () => false;
    const config = { get: (key: string, fallback: string) => ({ WHATSAPP_PHONE_NUMBER_ID: 'test-id', WHATSAPP_ACCESS_TOKEN: 'fake-test-token' })[key] || fallback };
    service = new WhatsAppService(repository, audit, config as any, web);
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ id: 'media-123' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ messages: [{ id: 'cloud-message' }] })));
    vi.stubGlobal('fetch', fetchMock);
    expect(service.getStatus()).toMatchObject({ configured: true, transport: 'API' });
    expect(await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester')).toMatchObject({ success: true, messageId: 'cloud-message' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const payload = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(payload).toMatchObject({ type: 'image', to: '96599887766', image: { id: 'media-123' } });
    expect(payload.image.caption).toContain('Pending Amount: 17.000 K.D.');
  });

  it('reports unavailable integration instead of claiming it sent a message', async () => {
    web.isEnabled = () => false;
    expect(service.getStatus()).toMatchObject({ ready: false, configured: false });
    expect(await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester')).toMatchObject({ success: false, mode: 'FALLBACK' });
  });

  it.each([
    ['9988 7766', '96599887766'], ['+965 9988-7766', '96599887766'], ['00965 99887766', '96599887766'],
    ['+91 90000 00000', '919000000000'], ['0091 90000 00000', '919000000000'], ['+977 9800000000', '9779800000000'],
    ['+1 (202) 555-0123', '12025550123'], ['+44 7700 900123', '447700900123'],
    ['+971 50 123 4567', '971501234567'], ['+966 50 123 4567', '966501234567'],
    ['+92 300 1234567', '923001234567'], ['+880 1712 345678', '8801712345678'],
    ['+683 8888', '6838888'], ['00683 8888', '6838888'],
  ])('preserves the country code in %s', async (phone, expected) => {
    invoice.customer.phone = phone;
    await service.sendInvoiceImage(12, 'PARTIAL_REMINDER', file, 'tester');
    expect(web.sendImage.mock.calls[0][0]).toBe(expected);
  });
});
