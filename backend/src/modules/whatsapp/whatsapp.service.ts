import {
  Injectable,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { AuditService } from '../audit/audit.service.js';
import { WhatsAppWebService } from './whatsapp-web.service.js';

/**
 * WhatsApp message types for invoice-related communications.
 */
export type WhatsAppMessageType =
  | 'FULL_PAYMENT_RECEIPT'
  | 'PARTIAL_PAYMENT_RECEIPT'
  | 'PENDING_REMINDER'
  | 'PARTIAL_REMINDER';

/**
 * Result of a WhatsApp send attempt.
 */
export interface WhatsAppSendResult {
  success: boolean;
  mode: 'API' | 'WEB' | 'FALLBACK';
  messageId?: string;
  mediaId?: string;
  error?: string;
  customerName?: string;
  invoiceNumber?: string;
  imageFilename?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly pendingSends = new Set<string>();
  private readonly recentSends = new Map<string, { at: number; result: WhatsAppSendResult }>();

  constructor(
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    private readonly web: WhatsAppWebService,
  ) {}

  /**
   * Check whether WhatsApp Cloud API is configured via environment variables.
   */
  isApiConfigured(): boolean {
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    return !!(phoneNumberId && accessToken);
  }

  /**
   * Get WhatsApp integration status (safe for frontend — no secrets exposed).
   */
  getStatus() {
    if (this.web.isEnabled()) return { ...this.web.getStatus(), configured: true, transport: 'WEB' };
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const configured = this.isApiConfigured();
    return {
      configured,
      ready: configured,
      transport: configured ? 'API' : 'NONE',
      phoneNumberId: configured ? phoneNumberId : undefined,
      apiVersion: this.configService.get<string>('WHATSAPP_API_VERSION', 'v21.0'),
    };
  }

  /**
   * Log native Web Share actions.
   */
  async logManualShare(
    data: {
      action: string;
      invoiceNumber: string;
      customerName?: string;
      paymentStatus?: string;
      imageFilename: string;
    },
    username: string,
  ) {
    await this.auditService.log({
      entityType: 'WHATSAPP_SHARE',
      entityId: data.invoiceNumber,
      action: data.action,
      performedBy: username,
      details: {
        invoiceNumber: data.invoiceNumber,
        customerName: data.customerName || 'Unknown',
        paymentStatus: data.paymentStatus,
        imageFilename: data.imageFilename,
      },
    });
    return { success: true };
  }

  /**
   * Validate the uploaded invoice image and invoice data, then send
   * the JPG image + text message via WhatsApp Cloud API.
   *
   * The frontend renders the Rashidi Star invoice via html2canvas and
   * uploads the resulting JPG here via multipart/form-data.
   */
  async sendInvoiceImage(
    invoiceId: number,
    messageType: WhatsAppMessageType,
    imageFile: any,
    username: string,
  ): Promise<WhatsAppSendResult> {
    // 1. Validate image file
    if (!imageFile) {
      throw new BadRequestException('Invoice image file is required.');
    }
    if (imageFile.mimetype !== 'image/jpeg') {
      throw new BadRequestException(`Invalid image type: ${imageFile.mimetype}. Only image/jpeg is accepted.`);
    }
    // Max 5MB
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Invoice image too large. Maximum 5MB.');
    }
    if (imageFile.size < 1000) {
      throw new BadRequestException('Invoice image too small. File may be corrupt.');
    }
    try {
      const metadata = await sharp(imageFile.buffer, { limitInputPixels: 20_000_000 }).metadata();
      if (metadata.format !== 'jpeg' || !metadata.width || !metadata.height) throw new Error('Invalid image');
    } catch {
      throw new BadRequestException('Invoice image must be a valid JPEG.');
    }

    // 2. Load invoice with customer
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: { customer: true, lines: { product: true } },
    });
    if (!invoice) {
      throw new BadRequestException(`Invoice with ID ${invoiceId} not found.`);
    }
    if (invoice.status !== 'POSTED') throw new BadRequestException('Only posted invoices can be sent.');
    const isReminder = messageType === 'PENDING_REMINDER' || messageType === 'PARTIAL_REMINDER';
    if (isReminder && Number(invoice.outstandingKd) <= 0) throw new BadRequestException('This invoice is paid. Send a receipt instead.');
    if (messageType === 'FULL_PAYMENT_RECEIPT' && Number(invoice.outstandingKd) > 0) throw new BadRequestException('This invoice is not fully paid. Refresh it before sending.');

    // 3. Validate customer phone
    const phone = invoice.customer?.phone;
    if (!phone) {
      throw new BadRequestException('Customer phone number is missing. Cannot send WhatsApp message.');
    }

    // Keep explicit international country codes; local eight-digit numbers default to Kuwait.
    const normalizedPhone = this.normalizeKuwaitPhone(phone);
    if (!normalizedPhone) {
      throw new BadRequestException('Invalid customer phone number. For international numbers, include + or 00 followed by the country code and phone number. Eight-digit local numbers default to Kuwait.');
    }

    // 5. Generate message text
    const messageText = this.generateMessage(invoice, messageType);
    const invoiceNumber = invoice.invoiceNumber;
    const customerName = invoice.customer?.name || 'Customer';
    const imageFilename = `Rashidi-Star-${invoiceNumber}.jpg`;

    // 6. Check if API is configured
    if (!this.web.isEnabled() && !this.isApiConfigured()) {
      // Log the attempt but return fallback mode
      await this.auditService.log({
        entityType: 'WHATSAPP',
        entityId: invoiceNumber,
        action: 'WHATSAPP_FALLBACK_MODE',
        performedBy: username,
        details: {
          invoiceNumber,
          customerName,
          customerPhone: normalizedPhone,
          messageType,
          imageFilename,
          reason: 'WhatsApp Business API credentials not configured',
        },
      });

      return {
        success: false,
        mode: 'FALLBACK',
        customerName,
        invoiceNumber,
        imageFilename,
        error: 'WhatsApp is not connected. Ask the admin to link it in Settings → WhatsApp.',
      };
    }

    const key = JSON.stringify([invoiceId, messageType, normalizedPhone, invoice.totalAmountKd, invoice.amountReceivedKd, invoice.outstandingKd]);
    // shortcut: duplicate protection lasts 60 seconds in this process; use durable receipts for hosted retries.
    for (const [id, sent] of this.recentSends) if (Date.now() - sent.at > 60000) this.recentSends.delete(id);
    const recent = this.recentSends.get(key);
    if (recent) return recent.result;
    if (this.pendingSends.has(key)) throw new ConflictException('This invoice is already being sent. Please wait.');
    this.pendingSends.add(key);
    const mode = this.web.isEnabled() ? 'WEB' : 'API';
    try {
      let mediaId: string | undefined;
      let messageId: string;
      if (mode === 'WEB') {
        messageId = await this.web.sendImage(normalizedPhone, imageFile.buffer, imageFilename, messageText);
      } else {
        const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID')!;
        const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN')!;
        const apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION', 'v21.0');

        // 7a. Upload image to WhatsApp Media API
        mediaId = await this.uploadMediaToWhatsApp(
          imageFile.buffer,
          imageFilename,
          phoneNumberId,
          accessToken,
          apiVersion,
        );

        // 7b. Send image message
        messageId = await this.sendWhatsAppImageMessage(
          normalizedPhone,
          mediaId,
          phoneNumberId,
          accessToken,
          apiVersion,
          messageText,
        );
      }

      const result: WhatsAppSendResult = { success: true, mode, messageId, mediaId, customerName, invoiceNumber, imageFilename };
      // Save before auditing: an audit outage must never cause the customer to receive a duplicate.
      this.recentSends.set(key, { at: Date.now(), result });

      // 8. Audit success
      await this.auditService.log({
        entityType: 'WHATSAPP',
        entityId: invoiceNumber,
        action: 'WHATSAPP_INVOICE_IMAGE_SENT',
        performedBy: username,
        details: {
          invoiceNumber,
          customerName,
          customerPhone: normalizedPhone,
          messageType,
          imageFilename,
          mediaId,
          messageId,
          mode,
        },
      }).catch(() => this.logger.error(`WhatsApp sent for ${invoiceNumber}, but its audit entry could not be saved.`));
      return result;
    } catch (err: any) {
      this.logger.error(`WhatsApp send failed for ${invoiceNumber}: ${err.message}`, err.stack);

      // Audit failure
      await this.auditService.log({
        entityType: 'WHATSAPP',
        entityId: invoiceNumber,
        action: 'WHATSAPP_IMAGE_SEND_FAILED',
        performedBy: username,
        details: {
          invoiceNumber,
          customerName,
          customerPhone: normalizedPhone,
          messageType,
          imageFilename,
          error: err.message?.substring(0, 500),
        },
      });

      return {
        success: false,
        mode,
        customerName,
        invoiceNumber,
        imageFilename,
        error: err.message || 'WhatsApp API send failed.',
      };
    } finally {
      this.pendingSends.delete(key);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // WhatsApp Cloud API Methods
  // ──────────────────────────────────────────────────────────────

  /**
   * Upload media (JPG image) to WhatsApp Media API.
   * Returns the media_id for use in send-image calls.
   */
  private async uploadMediaToWhatsApp(
    imageBuffer: Buffer,
    filename: string,
    phoneNumberId: string,
    accessToken: string,
    apiVersion: string,
  ): Promise<string> {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/media`;

    // Build multipart form data manually using fetch
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'image/jpeg');
    formData.append('file', new Blob([imageBuffer as any], { type: 'image/jpeg' }), filename);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`WhatsApp media upload failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { id: string };
    return data.id;
  }

  /**
   * Send an image message to a WhatsApp number using a previously uploaded media_id.
   */
  private async sendWhatsAppImageMessage(
    phone: string,
    mediaId: string,
    phoneNumberId: string,
    accessToken: string,
    apiVersion: string,
    caption: string,
  ): Promise<string> {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'image',
      image: {
        id: mediaId,
        caption,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`WhatsApp image send failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { messages: Array<{ id: string }> };
    const id = data.messages?.[0]?.id;
    if (!id) throw new Error('WhatsApp did not confirm the send. Check the chat before trying again.');
    return id;
  }

  // ──────────────────────────────────────────────────────────────
  // Message Generation (Server-side — mirrors frontend logic)
  // ──────────────────────────────────────────────────────────────

  private generateMessage(invoice: SalesInvoice, messageType: WhatsAppMessageType): string {
    const customerName = invoice.customer?.name || 'Customer';
    const invoiceNumber = invoice.invoiceNumber;
    const invoiceDate = invoice.invoiceDate;
    const invoiceTotal = Number(invoice.totalAmountKd || 0).toFixed(3);
    const amountPaid = Number(invoice.amountReceivedKd || 0).toFixed(3);
    const outstanding = Number(invoice.outstandingKd || 0).toFixed(3);
    const dueDate = invoice.dueDate;

    switch (messageType) {
      case 'FULL_PAYMENT_RECEIPT':
        return this.buildFullPaymentReceipt(customerName, invoiceNumber, invoiceDate, invoiceTotal, amountPaid);

      case 'PARTIAL_PAYMENT_RECEIPT':
        return this.buildPartialPaymentReceipt(customerName, invoiceNumber, invoiceDate, invoiceTotal, amountPaid, outstanding);

      case 'PENDING_REMINDER':
        return this.buildPendingReminder(customerName, invoiceNumber, invoiceDate, invoiceTotal, amountPaid, outstanding, dueDate);

      case 'PARTIAL_REMINDER':
        return this.buildPartialReminder(customerName, invoiceNumber, invoiceTotal, amountPaid, outstanding, dueDate);

      default:
        return this.buildPendingReminder(customerName, invoiceNumber, invoiceDate, invoiceTotal, amountPaid, outstanding, dueDate);
    }
  }

  private buildFullPaymentReceipt(
    customerName: string, invoiceNumber: string, date: string,
    invoiceTotal: string, amountPaid: string,
  ): string {
    const lines: string[] = [
      'Rashidi Star',
      '',
      'Payment Receipt',
      '',
      `Customer: ${customerName}`,
      `Date: ${date}`,
      '',
      `Invoice No: ${invoiceNumber}`,
      `Invoice Total: ${invoiceTotal} K.D.`,
      `Amount Paid: ${amountPaid} K.D.`,
      'Pending Amount: 0.000 K.D.',
      'Payment Status: FULLY PAID',
      '',
      'Payment received in full.',
      '',
      'Thank you for your payment.',
      'Shukran.',
    ];
    return lines.join('\n');
  }

  private buildPartialPaymentReceipt(
    customerName: string, invoiceNumber: string, date: string,
    invoiceTotal: string, amountPaid: string, outstanding: string,
  ): string {
    const lines: string[] = [
      'Rashidi Star',
      '',
      'Partial Payment Receipt',
      '',
      `Customer: ${customerName}`,
      `Date: ${date}`,
      '',
      `Invoice No: ${invoiceNumber}`,
      `Invoice Total: ${invoiceTotal} K.D.`,
      `Amount Paid: ${amountPaid} K.D.`,
      `Pending Amount: ${outstanding} K.D.`,
      'Payment Status: PARTIALLY PAID',
      '',
      'Partial payment received successfully.',
      '',
      'Thank you.',
      'Shukran.',
    ];
    return lines.join('\n');
  }

  private buildPendingReminder(
    customerName: string, invoiceNumber: string, invoiceDate: string,
    invoiceTotal: string, amountPaid: string, outstanding: string,
    dueDate?: string,
  ): string {
    const lines: string[] = [
      'Rashidi Star',
      '',
      'Payment Reminder',
      '',
      `Dear ${customerName},`,
      '',
      `Invoice No: ${invoiceNumber}`,
      `Invoice Date: ${invoiceDate}`,
      `Invoice Total: ${invoiceTotal} K.D.`,
      `Amount Paid: ${amountPaid} K.D.`,
      `Pending Amount: ${outstanding} K.D.`,
      'Payment Status: PENDING',
    ];

    if (dueDate && dueDate.trim() && dueDate !== 'null') {
      lines.push('');
      lines.push(`Due Date: ${dueDate}`);
    }

    lines.push('');
    lines.push('Kindly arrange the pending payment at your convenience.');
    lines.push('');
    lines.push('Thank you,');
    lines.push('Rashidi Star');
    return lines.join('\n');
  }

  private buildPartialReminder(
    customerName: string, invoiceNumber: string,
    invoiceTotal: string, amountPaid: string, outstanding: string,
    dueDate?: string,
  ): string {
    const lines: string[] = [
      'Rashidi Star',
      '',
      'Balance Payment Reminder',
      '',
      `Dear ${customerName},`,
      '',
      `Invoice No: ${invoiceNumber}`,
      `Invoice Total: ${invoiceTotal} K.D.`,
      `Amount Paid: ${amountPaid} K.D.`,
      `Pending Amount: ${outstanding} K.D.`,
      'Payment Status: PARTIALLY PAID',
    ];

    if (dueDate && dueDate.trim() && dueDate !== 'null') {
      lines.push('');
      lines.push(`Due Date: ${dueDate}`);
    }

    lines.push('');
    lines.push('Kindly arrange the remaining payment at your convenience.');
    lines.push('');
    lines.push('Thank you,');
    lines.push('Rashidi Star');
    return lines.join('\n');
  }

  // ──────────────────────────────────────────────────────────────
  // Phone Normalization
  // ──────────────────────────────────────────────────────────────

  private normalizeKuwaitPhone(phone: string): string {
    const value = phone.trim();
    if (!/^[+\d\s().-]+$/.test(value)) return '';
    const international = /^(\+|00)/.test(value);
    let clean = value.replace(/[^0-9]/g, '');
    if (clean.startsWith('00')) clean = clean.slice(2);
    if (!international && clean.length === 8) clean = `965${clean}`;
    const valid = international ? /^[1-9]\d{1,14}$/.test(clean) : /^[1-9]\d{7,14}$/.test(clean);
    return valid ? clean : '';
  }
}
