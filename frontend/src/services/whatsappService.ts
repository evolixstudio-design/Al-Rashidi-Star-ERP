/**
 * Rashidi Star - Centralized WhatsApp Service
 *
 * Invoice images are sent with their receipt/reminder caption through the backend.
 */
import api from './api';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { downloadFile } from '../utils/downloadFile';
import type { InvoiceData } from '../components/common/RashidiStarInvoiceSheet';
import {
  buildWhatsAppUrl,
  type WhatsAppPaymentData,
  type PaymentWhatsAppType,
} from '../utils/whatsappMessages';

export interface WhatsAppStatus {
  ready?: boolean;
  configured?: boolean;
  phoneNumberId?: string;
  message?: string;
  qr?: string;
  enabled?: boolean;
  state?: string;
  phone?: string;
  transport?: 'WEB' | 'API' | 'NONE';
}

export type WhatsAppMessageType = PaymentWhatsAppType;

export interface GeneratedInvoiceJpg {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Generate a high-resolution JPG image from an unscaled fixed A4 invoice DOM element.
 *
 * @param element - The raw unscaled fixed A4 invoice paper DOM element
 * @param invoiceNumber - The invoice number for the filename
 * @returns Blob and metadata, or null on failure
 */
export async function generateInvoiceJpg(
  element: HTMLElement,
  invoiceNumber: string,
): Promise<GeneratedInvoiceJpg | null> {
  try {
    const { default: html2canvas } = await import('html2canvas');
    // 1. Wait for web fonts
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 2. Wait for all images inside element
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const onDone = () => {
            img.removeEventListener('load', onDone);
            img.removeEventListener('error', onDone);
            resolve();
          };
          img.addEventListener('load', onDone);
          img.addEventListener('error', onDone);
          setTimeout(onDone, 3500);
        });
      })
    );

    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution (1985 x 2808)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      width: 794,
      height: 1123,
      // Cloning the full sales list can freeze the browser before the download starts.
      ignoreElements: (node) => document.body.contains(node) && !node.contains(element) && !element.contains(node),
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      return null;
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.95),
    );

    if (!blob) return null;

    const cleanInvNum = (invoiceNumber || 'INV').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `Rashidi-Star-${cleanInvNum}.jpg`;

    return {
      blob,
      filename,
      width: canvas.width,
      height: canvas.height,
      sizeBytes: blob.size,
    };
  } catch (err) {
    console.error('Failed to generate invoice JPG:', err);
    return null;
  }
}

/**
 * Download the JPG file to the user's device.
 */
export function downloadJpg(jpgBlob: Blob, filename: string): void {
  downloadFile(jpgBlob, filename);
}

/**
 * Map payment state to WhatsApp message type.
 */
export function resolveMessageType(
  paymentState: 'FULLY PAID' | 'PARTIALLY PAID' | 'PENDING',
  isReminder: boolean,
): WhatsAppMessageType {
  if (isReminder) {
    return paymentState === 'PARTIALLY PAID' ? 'PARTIAL_REMINDER' : 'PENDING_REMINDER';
  }
  if (paymentState === 'FULLY PAID') return 'FULL_PAYMENT_RECEIPT';
  if (paymentState === 'PARTIALLY PAID') return 'PARTIAL_PAYMENT_RECEIPT';
  return 'PENDING_REMINDER';
}

/**
 * Map WhatsAppMessageType to PaymentWhatsAppType for text message generation.
 */
function toPaymentWhatsAppType(mt: WhatsAppMessageType): PaymentWhatsAppType {
  return mt;
}

/**
 * Log the WhatsApp action to the backend audit trail.
 */
export async function logWhatsAppAction(
  action: 'WHATSAPP_CHAT_OPENED' | 'WHATSAPP_REMINDER_OPENED' | 'WHATSAPP_OUTSTANDING_BALANCE_REMINDER',
  invoiceNumber: string,
  customerName?: string,
  paymentStatus?: string,
) {
  try {
    await api.post('/whatsapp/log-share', {
      action,
      invoiceNumber,
      customerName,
      paymentStatus,
    });
  } catch (err) {
    console.error('Failed to log WhatsApp action:', err);
  }
}

/**
 * MAIN ORCHESTRATOR: Open WhatsApp text-only chat via wa.me
 *
 * @param invoiceNumber - Invoice number string
 * @param paymentData - Data for generating the text message
 * @param messageType - The type of WhatsApp message to send
 */
export async function openWhatsAppChat(
  invoiceNumber: string,
  paymentData: WhatsAppPaymentData,
  messageType: WhatsAppMessageType,
): Promise<void> {
  const textType = toPaymentWhatsAppType(messageType);
  const url = buildWhatsAppUrl(paymentData, textType);

  const isReminder = messageType === 'PENDING_REMINDER' || messageType === 'PARTIAL_REMINDER';
  const action = messageType === 'OUTSTANDING_BALANCE_REMINDER' 
    ? 'WHATSAPP_OUTSTANDING_BALANCE_REMINDER' 
    : (isReminder ? 'WHATSAPP_REMINDER_OPENED' : 'WHATSAPP_CHAT_OPENED');

  // Open during the click so slow audit requests cannot trigger popup blocking.
  window.open(url, '_blank', 'noopener,noreferrer');

  await logWhatsAppAction(
    action,
    invoiceNumber,
    paymentData.customerName || 'Customer',
    paymentData.paymentStatus || 'UNKNOWN'
  );

}

/**
 * Open WhatsApp directly with formatted text (used across Customers, Home, and Payments pages).
 */
export function openWhatsAppWithText(
  paymentData: WhatsAppPaymentData,
  messageType: WhatsAppMessageType,
): void {
  const invoiceNum = paymentData.invoiceNumber || paymentData.receiptNumber || 'INV';
  openWhatsAppChat(invoiceNum, paymentData, messageType);
}

/**
 * Check WhatsApp integration status for Settings page.
 */
export async function checkWhatsAppStatus(): Promise<WhatsAppStatus> {
  return (await api.get('/whatsapp/status')).data;
}

export async function sendInvoiceWhatsApp(invoiceId: number, isReminder: boolean): Promise<string> {
  const status = await checkWhatsAppStatus();
  if (!status.ready) throw new Error('WhatsApp is not connected. Ask the admin to link it in Settings → WhatsApp.');
  const invoice: InvoiceData = (await api.get(`/sales/${invoiceId}`)).data;
  if (invoice.invoiceStatus !== 'POSTED') throw new Error('Only posted invoices can be sent.');
  if (!invoice.customer?.phone) throw new Error('Add the customer phone number before sending.');
  const outstanding = Number(invoice.amountOutstandingKd);
  if (isReminder && outstanding <= 0) throw new Error('This invoice is paid. Send a receipt instead.');
  const paymentState = outstanding <= 0 ? 'FULLY PAID' : Number(invoice.amountReceivedKd) > 0 ? 'PARTIALLY PAID' : 'PENDING';

  const { RashidiStarInvoiceSheet } = await import('../components/common/RashidiStarInvoiceSheet');
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:white;pointer-events:none';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(createElement(RashidiStarInvoiceSheet, { invoice, isExport: true })));
    const element = host.firstElementChild as HTMLElement | null;
    const image = element && await generateInvoiceJpg(element, invoice.invoiceNumber);
    if (!image) throw new Error('Invoice image could not be generated. Nothing was sent.');
    const form = new FormData();
    form.append('invoiceId', String(invoiceId));
    form.append('messageType', resolveMessageType(paymentState, isReminder));
    form.append('invoiceImage', image.blob, image.filename);
    const { data } = await api.post('/whatsapp/send-invoice', form, { headers: { 'Content-Type': undefined }, timeout: 120000 });
    if (!data.success) throw new Error(data.error || 'WhatsApp could not send this invoice.');
    return `Invoice ${invoice.invoiceNumber} image and ${isReminder ? 'reminder' : 'receipt'} sent to WhatsApp.`;
  } finally {
    root.unmount();
    host.remove();
  }
}

export async function sendCustomerInvoiceReminders(customerId: number, onProgress: (text: string) => void): Promise<string> {
  const { data: invoices } = await api.get<{ id: number; invoiceNumber: string }[]>(`/customers/${customerId}/pending-invoices`);
  if (!invoices.length) throw new Error('No unpaid invoice is available to attach. Opening balances have no invoice image.');
  let sent = 0;
  for (const invoice of invoices) {
    onProgress(`Sending invoice ${sent + 1} of ${invoices.length}…`);
    try {
      await sendInvoiceWhatsApp(invoice.id, true);
      sent++;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'WhatsApp send failed.';
      throw new Error(`${sent} of ${invoices.length} sent. Stopped at ${invoice.invoiceNumber}: ${reason}`);
    }
  }
  return `${sent} invoice image${sent === 1 ? '' : 's'} with reminder text sent to WhatsApp.`;
}
