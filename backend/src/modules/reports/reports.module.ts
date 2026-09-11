import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { SalesInvoiceLine } from '../../database/entities/sales-invoice-line.entity.js';
import { PurchaseReceipt } from '../../database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from '../../database/entities/purchase-line.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { Customer } from '../../database/entities/customer.entity.js';
import { Expense } from '../../database/entities/expense.entity.js';
import { Category } from '../../database/entities/category.entity.js';
import { SalesReturn } from '../../database/entities/sales-return.entity.js';
import { SalesReturnLine } from '../../database/entities/sales-return-line.entity.js';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesInvoice,
      SalesInvoiceLine,
      PurchaseReceipt,
      PurchaseLine,
      Product,
      Customer,
      Expense,
      Category,
      SalesReturn,
      SalesReturnLine,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
