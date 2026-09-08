import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseReceipt } from '../../database/entities/purchase-receipt.entity.js';
import { PurchaseLine } from '../../database/entities/purchase-line.entity.js';
import { Supplier } from '../../database/entities/supplier.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { PurchasesService } from './purchases.service.js';
import { PurchasesController } from './purchases.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseReceipt,
      PurchaseLine,
      Supplier,
      Product,
      StockLedger,
    ]),
    AuditModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
