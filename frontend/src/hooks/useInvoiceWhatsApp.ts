import { useRef, useState } from 'react';
import { openWhatsAppWithText, sendCustomerInvoiceReminders, sendInvoiceWhatsApp, type WhatsAppMessageType } from '../services/whatsappService';
import type { WhatsAppPaymentData } from '../utils/whatsappMessages';

export interface WhatsAppFallback {
  paymentData: WhatsAppPaymentData;
  messageType: WhatsAppMessageType;
}

export function useInvoiceWhatsApp() {
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState<WhatsAppFallback | null>(null);
  // Render Free cannot preserve a QR session; hosted buttons use the manual text flow.
  const directAvailable = import.meta.env.DEV;
  const openManual = (draft: WhatsAppFallback) => {
    openWhatsAppWithText(draft.paymentData, draft.messageType);
    setFallback(null);
    setMessage('WhatsApp draft opened. Review the message and press Send in WhatsApp.');
  };
  const run = async (action: () => Promise<string>, manualFallback: WhatsAppFallback) => {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setFallback(null);
    setMessage('Preparing invoice image and WhatsApp message…');
    try {
      setMessage(await action());
    } catch (error: unknown) {
      const response = error as { response?: { data?: { message?: string } } };
      setMessage(response.response?.data?.message || (error instanceof Error ? error.message : 'WhatsApp send failed.'));
      setFallback(manualFallback);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  return {
    busy, message, fallback, directAvailable,
    sendInvoice: (id: number, reminder: boolean, manualFallback: WhatsAppFallback) => directAvailable ? run(() => sendInvoiceWhatsApp(id, reminder), manualFallback) : openManual(manualFallback),
    sendCustomer: (id: number, manualFallback: WhatsAppFallback) => directAvailable ? run(() => sendCustomerInvoiceReminders(id, setMessage), manualFallback) : openManual(manualFallback),
  };
}
