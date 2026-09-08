import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Customer } from './customer.entity.js';
import { SalesInvoiceLine } from './sales-invoice-line.entity.js';

export type InvoicePaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';
export type InvoiceStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

@Entity('sales_invoices')
export class SalesInvoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  invoiceNumber!: string;

  @Column({ type: 'int' })
  customerId!: number;

  @ManyToOne(() => Customer, (c) => c.invoices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer?: Relation<Customer>;

  @Column({ type: 'date' })
  invoiceDate!: string;

  @Column({ type: 'int', default: 0 })
  totalPcs!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalAmountKd!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  amountReceivedKd!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  outstandingKd!: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  paymentStatus!: InvoicePaymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: string;

  @Column({ type: 'varchar', length: 20, default: 'POSTED' })
  status!: InvoiceStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100 })
  createdBy!: string;

  @OneToMany(() => SalesInvoiceLine, (line) => line.invoice, { cascade: true })
  lines?: Relation<SalesInvoiceLine>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
