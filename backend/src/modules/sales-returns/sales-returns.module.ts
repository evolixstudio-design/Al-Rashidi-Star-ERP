import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesReturn } from '../../database/entities/sales-return.entity.js';
import { SalesReturnLine } from '../../database/entities/sales-return-line.entity.js';
import { CustomerRefund } from '../../database/entities/customer-refund.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from '../../database/entities/sales-invoice-line.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { DocumentSequence } from '../../database/entities/document-sequence.entity.js';
import { SalesReturnsService } from './sales-returns.service.js';
import { SalesReturnsController } from './sales-returns.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesReturn,
      SalesReturnLine,
      CustomerRefund,
      SalesInvoice,
      SalesInvoiceLine,
      Customer,
      Product,
      StockLedger,
      DocumentSequence,
    ]),
    AuditModule,
  ],
  controllers: [SalesReturnsController],
  providers: [SalesReturnsService],
  exports: [SalesReturnsService],
})
export class SalesReturnsModule {}
