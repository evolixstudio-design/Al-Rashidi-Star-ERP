import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerReceipt, SalesInvoice, Customer]),
    AuditModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
