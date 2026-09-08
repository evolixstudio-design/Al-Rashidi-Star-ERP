import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { SalesInvoice } from './sales-invoice.entity.js';
import { Product } from './product.entity.js';

@Entity('sales_invoice_lines')
export class SalesInvoiceLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  invoiceId!: number;

  @ManyToOne(() => SalesInvoice, (inv) => inv.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Relation<SalesInvoice>;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product?: Relation<Product>;

  @Column({ type: 'int', default: 0 })
  dozen!: number;

  @Column({ type: 'int', default: 0 })
  pieces!: number;

  @Column({ type: 'int', default: 0 })
  totalPcs!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  unitPriceKd!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  lineTotalKd!: number;
}
