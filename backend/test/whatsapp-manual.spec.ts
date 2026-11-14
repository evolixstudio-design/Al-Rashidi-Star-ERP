import { afterEach, expect, it, vi } from 'vitest';
import { openWhatsAppWithText } from '../../frontend/src/services/whatsappService';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../frontend/src/services/api', () => ({ default: { post } }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  post.mockReset();
});

it('opens an international WhatsApp draft immediately without waiting for the backend', () => {
  const open = vi.fn();
  vi.stubGlobal('window', { open });
  vi.stubGlobal('navigator', { userAgent: 'Windows Chrome' });
  post.mockReturnValue(new Promise(() => {}));
  openWhatsAppWithText({
    customerName: 'Test customer', customerPhone: '+44 7700 900123', invoiceNumber: 'TEST-FALLBACK',
    invoiceTotal: 27, totalPaid: 10, outstandingAmount: 17,
  }, 'PARTIAL_REMINDER');
  expect(open).toHaveBeenCalledOnce();
  const draft = new URL(open.mock.calls[0][0]);
  expect(draft.searchParams.get('phone')).toBe('447700900123');
  expect(draft.searchParams.get('text')).toContain('Invoice No: TEST-FALLBACK');
  expect(draft.searchParams.get('text')).toContain('Pending Amount: 17.000 K.D.');
  expect(post).toHaveBeenCalledExactlyOnceWith('/whatsapp/log-share', expect.objectContaining({ action: 'WHATSAPP_REMINDER_OPENED' }));
});

it('keeps the manual customer reminder available when auditing is offline', async () => {
  const open = vi.fn();
  vi.stubGlobal('window', { open });
  vi.stubGlobal('navigator', { userAgent: 'Android' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  post.mockRejectedValue(new Error('Backend offline'));
  openWhatsAppWithText({ customerName: 'Test customer', customerPhone: '+971 50 123 4567', outstandingAmount: 44.125 }, 'OUTSTANDING_BALANCE_REMINDER');
  const draft = new URL(open.mock.calls[0][0]);
  expect(draft.pathname).toBe('/971501234567');
  expect(draft.searchParams.get('text')).toContain('Total Outstanding Balance: 44.125 K.D.');
  await vi.waitFor(() => expect(console.error).toHaveBeenCalled());
  expect(open).toHaveBeenCalledOnce();
  expect(post.mock.calls.every(([url]) => url === '/whatsapp/log-share')).toBe(true);
});
