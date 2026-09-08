/**
 * Rashidi Star - Centralized WhatsApp Service
 *
 * WhatsApp action is strictly text-only via wa.me.
 * Invoice image download is a separate action.
 */
import html2canvas from 'html2canvas';
import api from './api';
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
      allowTaint: true,
      width: 794,
      height: 1123,
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
  const url = URL.createObjectURL(jpgBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  action: 'WHATSAPP_CHAT_OPENED' | 'WHATSAPP_REMINDER_OPENED',
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
  const action = isReminder ? 'WHATSAPP_REMINDER_OPENED' : 'WHATSAPP_CHAT_OPENED';

  // 1. Log the action
  await logWhatsAppAction(
    action,
    invoiceNumber,
    paymentData.customerName || 'Customer',
    paymentData.paymentStatus || 'UNKNOWN'
  );

  // 2. Open WhatsApp
  window.open(url, '_blank', 'noopener,noreferrer');
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
  return { ready: true, configured: true, message: 'WhatsApp Direct (wa.me) Active' };
}
