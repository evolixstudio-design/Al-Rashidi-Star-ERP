import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Customer } from './customer.entity.js';
import { SalesInvoice } from './sales-invoice.entity.js';

@Entity('customer_receipts')
export class CustomerReceipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  receiptNumber!: string;

  @Column({ type: 'int' })
  customerId!: number;

  @ManyToOne(() => Customer, (c) => c.receipts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer?: Relation<Customer>;

  @Column({ type: 'int', nullable: true })
  invoiceId?: number;

  @ManyToOne(() => SalesInvoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Relation<SalesInvoice>;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amountKd!: number;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod!: string;

  @Column({ type: 'date' })
  receiptDate!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100 })
  performedBy!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
