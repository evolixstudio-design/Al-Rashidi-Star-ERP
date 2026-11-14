import { useRef, useState } from 'react';
import { sendCustomerInvoiceReminders, sendInvoiceWhatsApp } from '../services/whatsappService';

export function useInvoiceWhatsApp() {
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (action: () => Promise<string>) => {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setMessage('Preparing invoice image and WhatsApp message…');
    try {
      setMessage(await action());
    } catch (error: unknown) {
      const response = error as { response?: { data?: { message?: string } } };
      setMessage(response.response?.data?.message || (error instanceof Error ? error.message : 'WhatsApp send failed.'));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };
  return {
    busy, message,
    sendInvoice: (id: number, reminder: boolean) => run(() => sendInvoiceWhatsApp(id, reminder)),
    sendCustomer: (id: number) => run(() => sendCustomerInvoiceReminders(id, setMessage)),
  };
}
