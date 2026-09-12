import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesReturn } from './sales-return.entity.js';
import { SalesInvoiceLine } from './sales-invoice-line.entity.js';
import { Product } from './product.entity.js';
import type { Relation } from 'typeorm';

@Entity('sales_return_lines')
export class SalesReturnLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  salesReturnId!: number;

  @ManyToOne(() => SalesReturn, (salesReturn) => salesReturn.lines, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'salesReturnId' })
  salesReturn!: Relation<SalesReturn>;

  @Column({ type: 'int' })
  invoiceLineId!: number;

  @ManyToOne(() => SalesInvoiceLine, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoiceLineId' })
  invoiceLine!: Relation<SalesInvoiceLine>;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product!: Relation<Product>;

  @Column({ type: 'int', default: 0 })
  returnDozen!: number;

  @Column({ type: 'int', default: 0 })
  returnPieces!: number;

  @Column({ type: 'int', default: 0 })
  returnTotalPcs!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  originalUnitPriceKd!: number | string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  returnLineAmountKd!: number | string;
}
