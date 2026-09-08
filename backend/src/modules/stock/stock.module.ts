import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { Product } from '../../database/entities/product.entity.js';
import { StockService } from './stock.service.js';
import { StockController } from './stock.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([StockLedger, Product]), AuditModule],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
