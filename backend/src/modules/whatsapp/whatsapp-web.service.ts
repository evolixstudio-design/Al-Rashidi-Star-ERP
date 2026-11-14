import { BadRequestException, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Client } from 'whatsapp-web.js';

@Injectable()
export class WhatsAppWebService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppWebService.name);
  private client?: Client;
  private state = 'DISCONNECTED';
  private qr?: string;
  private phone?: string;
  private error?: string;
  private starting = false;
  private readonly sessionPath = path.resolve('.wwebjs_auth');

  constructor(private readonly config: ConfigService) {}

  isEnabled() {
    // shortcut: QR sessions run on this PC only; choose durable hosting before enabling production.
    return this.config.get('NODE_ENV') !== 'production' && this.config.get('WHATSAPP_WEB_ENABLED') === 'true';
  }

  getStatus(includeQr = false) {
    return {
      enabled: this.isEnabled(), ready: this.isEnabled() && this.state === 'READY',
      state: this.isEnabled() ? this.state : 'DISABLED', phone: this.phone,
      message: this.error, ...(includeQr ? { qr: this.qr } : {}),
    };
  }

  onModuleInit() {
    if (this.isEnabled() && existsSync(path.join(this.sessionPath, 'session'))) void this.connect();
  }

  async connect() {
    if (!this.isEnabled()) throw new BadRequestException('QR linking is enabled on localhost only.');
    if (this.starting || ['STARTING', 'QR', 'AUTHENTICATING', 'READY'].includes(this.state)) return this.getStatus(true);
    this.starting = true;
    this.state = 'STARTING';
    this.error = this.qr = this.phone = undefined;
    try {
      if (this.client) await this.client.destroy().catch(() => {});
      const { default: whatsapp } = await import('whatsapp-web.js');
      const client = new whatsapp.Client({
        authStrategy: new whatsapp.LocalAuth({ dataPath: this.sessionPath }),
        puppeteer: { headless: true, executablePath: this.config.get<string>('WHATSAPP_CHROME_PATH') || undefined },
        authTimeoutMs: 120000,
      });
      this.client = client;
      client.on('qr', (qr: string) => {
        if (this.client !== client) return;
        this.qr = qr;
        this.state = 'QR';
      });
      client.on('authenticated', () => {
        if (this.client !== client) return;
        this.qr = undefined;
        this.state = 'AUTHENTICATING';
      });
      client.on('ready', () => {
        if (this.client !== client) return;
        this.qr = this.error = undefined;
        this.phone = client.info?.wid?.user;
        this.state = 'READY';
      });
      client.on('auth_failure', () => {
        if (this.client !== client) return;
        this.qr = this.phone = undefined;
        this.state = 'ERROR';
        this.error = 'WhatsApp could not link. Please reconnect and scan a new QR code.';
      });
      client.on('disconnected', () => {
        if (this.client !== client) return;
        this.qr = this.phone = undefined;
        this.state = 'DISCONNECTED';
      });
      void client.initialize().catch(async (error: Error) => {
        if (this.client !== client) return;
        this.state = 'ERROR';
        this.qr = this.phone = undefined;
        this.error = 'WhatsApp could not start. Check Chrome and the internet connection, then reconnect.';
        this.logger.warn(`WhatsApp initialization failed: ${error.message}`);
        await client.destroy().catch(() => {});
      });
    } catch (error) {
      this.state = 'ERROR';
      this.error = 'WhatsApp could not start. Check the local Chrome installation and reconnect.';
      this.logger.warn(error instanceof Error ? error.message : 'WhatsApp initialization failed');
    } finally {
      this.starting = false;
    }
    return this.getStatus(true);
  }

  async disconnect() {
    const client = this.client;
    this.client = undefined;
    this.qr = this.phone = this.error = undefined;
    this.state = 'DISCONNECTED';
    if (client) {
      try { await client.logout(); } finally { await client.destroy().catch(() => {}); }
    }
    return this.getStatus(true);
  }

  async sendImage(phone: string, image: Buffer, filename: string, caption: string) {
    const client = this.client;
    if (!client || !this.getStatus().ready) throw new BadRequestException('WhatsApp is not connected. Ask the admin to link it in Settings → WhatsApp.');
    const recipient = await client.getNumberId(phone);
    if (!recipient) throw new BadRequestException('This customer phone number is not registered on WhatsApp.');
    const { default: whatsapp } = await import('whatsapp-web.js');
    const media = new whatsapp.MessageMedia('image/jpeg', image.toString('base64'), filename);
    const message = await client.sendMessage(recipient._serialized, media, { caption, sendSeen: false, waitUntilMsgSent: true });
    if (!message?.id?._serialized) throw new Error('WhatsApp did not confirm the send. Check the chat before trying again.');
    return message.id._serialized;
  }

  async onModuleDestroy() {
    const client = this.client;
    this.client = undefined;
    this.state = 'DISCONNECTED';
    this.qr = this.phone = undefined;
    await client?.destroy().catch(() => {});
  }
}
