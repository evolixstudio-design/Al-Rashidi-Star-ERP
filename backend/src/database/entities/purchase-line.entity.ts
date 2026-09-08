import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { PurchaseReceipt } from './purchase-receipt.entity.js';
import { Product } from './product.entity.js';

@Entity('purchase_lines')
export class PurchaseLine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  receiptId!: number;

  @ManyToOne(() => PurchaseReceipt, (r) => r.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiptId' })
  receipt?: Relation<PurchaseReceipt>;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product?: Relation<Product>;

  @Column({ type: 'int', default: 0 })
  dozen!: number;

  @Column({ type: 'int', default: 0 })
  pieces!: number;

  @Column({ type: 'int' })
  totalPcs!: number; // dozen * 12 + pieces

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  unitCostKd!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  lineTotalKd!: number;
}
