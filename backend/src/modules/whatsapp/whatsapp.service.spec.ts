import { beforeEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { WhatsAppService } from './whatsapp.service.js';

describe('invoice image and reminder sending', () => {
  let invoice: any;
  let repository: any;
  let audit: any;
  let web: any;
  let service: WhatsAppService;
  let file: any;

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
});
