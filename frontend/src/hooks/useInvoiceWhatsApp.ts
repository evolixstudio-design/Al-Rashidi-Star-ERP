import { useRef, useState } from 'react';
import { sendCustomerInvoiceReminders, sendInvoiceWhatsApp, type WhatsAppMessageType } from '../services/whatsappService';
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
    busy, message, fallback,
    sendInvoice: (id: number, reminder: boolean, manualFallback: WhatsAppFallback) => run(() => sendInvoiceWhatsApp(id, reminder), manualFallback),
    sendCustomer: (id: number, manualFallback: WhatsAppFallback) => run(() => sendCustomerInvoiceReminders(id, setMessage), manualFallback),
  };
}
