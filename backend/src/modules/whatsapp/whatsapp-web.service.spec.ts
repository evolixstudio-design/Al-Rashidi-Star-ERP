import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsAppWebService } from './whatsapp-web.service.js';

const mocks = vi.hoisted(() => ({ clients: [] as any[], failInit: false, failCreate: false }));
vi.mock('whatsapp-web.js', async () => {
  const { EventEmitter } = await import('node:events');
  class Client extends EventEmitter {
    info = { wid: { user: '96590000000' } };
    initialize = vi.fn(async () => { if (mocks.failInit) throw new Error('Browser unavailable'); });
    destroy = vi.fn().mockResolvedValue(undefined);
    logout = vi.fn().mockResolvedValue(undefined);
    getNumberId = vi.fn().mockResolvedValue({ _serialized: '96599887766@c.us' });
    sendMessage = vi.fn().mockResolvedValue({ id: { _serialized: 'sent-123' } });
    constructor(public options: any) { super(); if (mocks.failCreate) throw new Error('Browser unavailable'); mocks.clients.push(this); }
  }
  return { default: { Client, LocalAuth: class { constructor(public options: any) {} },
    MessageMedia: class { constructor(public mimetype: string, public data: string, public filename: string) {} } } };
});

describe('local QR WhatsApp connection', () => {
  let service: WhatsAppWebService;
  beforeEach(() => {
    mocks.clients.length = 0;
    mocks.failInit = mocks.failCreate = false;
    service = new WhatsAppWebService({ get: (key: string) => ({ NODE_ENV: 'development', WHATSAPP_WEB_ENABLED: 'true' })[key] } as any);
  });
  afterEach(async () => { await service.onModuleDestroy(); });

  it('starts one client, hides QR from ordinary status, and clears it when linked', async () => {
    await Promise.all([service.connect(), service.connect()]);
    expect(mocks.clients).toHaveLength(1);
    const client = mocks.clients[0] as EventEmitter;
    client.emit('qr', 'secret-link-qr');
    expect(service.getStatus().qr).toBeUndefined();
    expect(service.getStatus(true)).toMatchObject({ qr: 'secret-link-qr', ready: false });
    client.emit('authenticated');
    expect(service.getStatus(true).qr).toBeUndefined();
    client.emit('ready');
    expect(service.getStatus(true)).toMatchObject({ ready: true, phone: '96590000000' });
  });

  it('sends a single image with its caption to a registered phone', async () => {
    await service.connect();
    const client = mocks.clients[0];
    client.emit('ready');
    expect(await service.sendImage('96599887766', Buffer.from('jpeg'), 'invoice.jpg', 'Payment reminder')).toBe('sent-123');
    expect(client.sendMessage).toHaveBeenCalledWith('96599887766@c.us', expect.objectContaining({ mimetype: 'image/jpeg', filename: 'invoice.jpg' }),
      { caption: 'Payment reminder', sendSeen: false, waitUntilMsgSent: true });
  });

  it('refuses disconnected and unregistered recipients without sending', async () => {
    await expect(service.sendImage('96599887766', Buffer.from('jpeg'), 'invoice.jpg', 'Reminder')).rejects.toThrow('not connected');
    await service.connect();
    const client = mocks.clients[0];
    client.emit('ready');
    client.getNumberId.mockResolvedValue(null);
    await expect(service.sendImage('96599887766', Buffer.from('jpeg'), 'invoice.jpg', 'Reminder')).rejects.toThrow('not registered');
    expect(client.sendMessage).not.toHaveBeenCalled();
  });

  it('disables QR linking in production even if the local enable flag is present', async () => {
    service = new WhatsAppWebService({ get: (key: string) => ({ NODE_ENV: 'production', WHATSAPP_WEB_ENABLED: 'true' })[key] } as any);
    expect(service.getStatus().enabled).toBe(false);
    await expect(service.connect()).rejects.toThrow('localhost only');
    expect(mocks.clients).toHaveLength(0);
  });

  it('logs out only when explicitly disconnected, preserving the session on shutdown', async () => {
    await service.connect();
    const client = mocks.clients[0];
    client.emit('ready');
    await service.onModuleDestroy();
    expect(client.destroy).toHaveBeenCalledOnce();
    expect(client.logout).not.toHaveBeenCalled();
    await service.connect();
    await service.disconnect();
    expect(mocks.clients[1].logout).toHaveBeenCalledOnce();
    expect(service.getStatus()).toMatchObject({ ready: false, state: 'DISCONNECTED' });
  });

  it('clears the QR and ready state after authentication failure or disconnection', async () => {
    await service.connect();
    const client = mocks.clients[0];
    client.emit('qr', 'secret-qr');
    client.emit('auth_failure');
    expect(service.getStatus(true)).toMatchObject({ state: 'ERROR', ready: false, qr: undefined });
    client.emit('ready');
    client.emit('disconnected');
    expect(service.getStatus(true)).toMatchObject({ state: 'DISCONNECTED', ready: false, qr: undefined, phone: undefined });
  });

  it.each(['initialize', 'create'])('reports a %s failure and can reconnect', async (stage) => {
    mocks.failInit = stage === 'initialize';
    mocks.failCreate = stage === 'create';
    await service.connect();
    await vi.waitFor(() => expect(service.getStatus()).toMatchObject({ state: 'ERROR', ready: false }));
    expect(service.getStatus().message).toContain('could not start');
    mocks.failInit = mocks.failCreate = false;
    await service.connect();
    expect(service.getStatus().state).toBe('STARTING');
  });

  it('refuses to call an unconfirmed send successful', async () => {
    await service.connect();
    const client = mocks.clients[0];
    client.emit('ready');
    client.sendMessage.mockResolvedValue(undefined);
    await expect(service.sendImage('96599887766', Buffer.from('jpeg'), 'invoice.jpg', 'Reminder')).rejects.toThrow('did not confirm');
  });
});
