import { openWhatsAppWithText } from '../../services/whatsappService';
import type { WhatsAppFallback } from '../../hooks/useInvoiceWhatsApp';

export function WhatsAppSendFeedback({ message, busy, fallback }: {
  message: string;
  busy: boolean;
  fallback: WhatsAppFallback | null;
}) {
  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className="p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 space-y-2 print:hidden">
      <p>{message}</p>
      {fallback && !busy && <>
        <p className="font-semibold">Prepared for {fallback.paymentData.customerName || 'Customer'}{fallback.paymentData.invoiceNumber ? ` · ${fallback.paymentData.invoiceNumber}` : ''}</p>
        <p className="text-xs">Check the customer’s chat before retrying, especially if some invoices were already sent.</p>
        <button type="button" onClick={() => openWhatsAppWithText(fallback.paymentData, fallback.messageType)} className="px-3 py-2 rounded-lg border border-emerald-700 text-emerald-800 font-semibold hover:bg-emerald-50">
          Open WhatsApp (text only)
        </button>
        <p className="text-xs">Opens a prepared message for you to send. To include the image manually, use Download Invoice Image on the invoice and attach it in WhatsApp.</p>
      </>}
    </div>
  );
}
