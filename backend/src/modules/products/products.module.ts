import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../database/entities/product.entity.js';
import { Category } from '../../database/entities/category.entity.js';
import { StockLedger } from '../../database/entities/stock-ledger.entity.js';
import { Supplier } from '../../database/entities/supplier.entity.js';
import { ProductsService } from './products.service.js';
import { ProductsController, CategoriesController } from './products.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, StockLedger, Supplier]),
    AuditModule,
  ],
  controllers: [ProductsController, CategoriesController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
