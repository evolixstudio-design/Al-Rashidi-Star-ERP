import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity.js';

export type StockSourceType =
  | 'OPENING_BALANCE'
  | 'RECEIVE_SHIPMENT'
  | 'SALES_INVOICE'
  | 'STOCK_ADJUSTMENT';

@Entity('stock_ledger')
export class StockLedger {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  movementDate!: Date;

  @Column({ type: 'int' })
  quantityChangePcs!: number; // +ve for incoming, -ve for outgoing

  @Column({ type: 'int' })
  balanceAfterPcs!: number;

  @Column({ type: 'varchar', length: 50 })
  sourceType!: StockSourceType;

  @Column({ type: 'int', nullable: true })
  sourceId?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceReference?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100 })
  performedBy!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
