import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { WhatsAppService } from './whatsapp.service.js';
import { WhatsAppController } from './whatsapp.controller.js';
import { WhatsAppWebService } from './whatsapp-web.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesInvoice]),
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppWebService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
