import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../database/entities/customer.entity.js';
import { SalesInvoice } from '../../database/entities/sales-invoice.entity.js';
import { CustomerReceipt } from '../../database/entities/customer-receipt.entity.js';
import { CustomerOpeningBalanceAdjustment } from '../../database/entities/customer-opening-balance-adjustment.entity.js';
import { CustomerReceiptAllocation } from '../../database/entities/customer-receipt-allocation.entity.js';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer, 
      SalesInvoice, 
      CustomerReceipt,
      CustomerOpeningBalanceAdjustment,
      CustomerReceiptAllocation
    ]),
    AuditModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
