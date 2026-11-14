import { useEffect, useState } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import type { WhatsAppStatus } from '../../services/whatsappService';

export function WhatsAppConnection() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [qrImage, setQrImage] = useState<{ code: string; image: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let active = true;
    const refresh = async () => {
      try {
        const { data } = await api.get<WhatsAppStatus>('/whatsapp/connection', { timeout: 10000 });
        if (active) { setStatus(data); setError(''); }
      } catch { if (active) setError('Could not check the WhatsApp connection. Check that localhost is running.'); }
    };
    void refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let active = true;
    const code = status?.qr;
    if (code) {
      void import('qrcode').then(({ toDataURL }) => toDataURL(code, { width: 280, margin: 2 }))
        .then((image) => { if (active) setQrImage({ code, image }); })
        .catch(() => { if (active) setError('Could not display the QR code. Please reconnect.'); });
    }
    return () => { active = false; };
  }, [status?.qr]);

  const changeConnection = async (action: 'connect' | 'disconnect') => {
    if (busy) return;
    setBusy(true);
    setError('');
    try { setStatus((await api.post<WhatsAppStatus>(`/whatsapp/${action}`)).data); }
    catch { setError('Could not change the WhatsApp connection. Please try again.'); }
    finally { setBusy(false); }
  };

  const starting = ['STARTING', 'AUTHENTICATING', 'QR'].includes(status?.state || '');
  if (!import.meta.env.DEV) return (
    <section className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-300 space-y-3" aria-labelledby="whatsapp-connection-title">
      <h2 id="whatsapp-connection-title" className="font-bold text-slate-900">WhatsApp sharing</h2>
      <p className="text-sm text-slate-700">WhatsApp buttons open a prepared receipt or reminder for you to review and send. No ERP QR connection is needed.</p>
      <p className="text-sm text-slate-700">To include an invoice image, choose Download Invoice Image on the invoice and attach it in WhatsApp.</p>
      <p className="text-xs text-slate-600">Direct image-and-text sending through a linked QR session is available on localhost. The current hosted plan uses manual WhatsApp sharing.</p>
    </section>
  );
  return (
    <section className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-300 space-y-4" aria-labelledby="whatsapp-connection-title">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-emerald-700" />
        <div>
          <h2 id="whatsapp-connection-title" className="font-bold text-slate-900">WhatsApp invoice sharing</h2>
          <p className="text-xs text-slate-600">Send invoice images with receipt or reminder text together.</p>
        </div>
      </div>
      <p role="status" className="text-sm font-semibold text-slate-800">
        {status?.ready ? `Connected${status.phone ? `: +${status.phone}` : ''}` : starting ? 'Linking WhatsApp…' : status?.enabled === false ? 'Available on localhost only' : 'WhatsApp is not connected'}
      </p>
      {(error || status?.message) && <p role="alert" className="text-sm text-red-700">{error || status?.message}</p>}
      {status?.qr && qrImage?.code === status.qr && <div className="flex flex-col sm:flex-row items-start gap-4">
        <img src={qrImage.image} width={280} height={280} alt="Scan this QR code in WhatsApp Linked devices" className="max-w-full border border-slate-200 rounded-lg" />
        <p className="text-sm text-slate-700 max-w-sm">Open WhatsApp on your phone → Settings or menu → Linked devices → Link a device. Scan this code and wait for “Connected”.</p>
      </div>}
      {status?.enabled && <div className="flex gap-3">
        {!status.ready && !starting && <button type="button" disabled={busy} onClick={() => void changeConnection('connect')} className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50">{busy ? 'Starting…' : 'Connect WhatsApp'}</button>}
        {(status.ready || starting) && <button type="button" disabled={busy} onClick={() => void changeConnection('disconnect')} className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 disabled:opacity-50">{busy ? 'Disconnecting…' : 'Disconnect'}</button>}
        {starting && <RefreshCw aria-hidden="true" className="w-5 h-5 my-auto animate-spin text-emerald-700" />}
      </div>}
      <p className="text-xs text-slate-600">Keep this PC and the local service running. This QR connection uses an unofficial WhatsApp integration and can be disconnected or restricted by WhatsApp.</p>
    </section>
  );
}
