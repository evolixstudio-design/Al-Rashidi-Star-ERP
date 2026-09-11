import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SalesInvoice } from './sales-invoice.entity.js';
import { Customer } from './customer.entity.js';
import { SalesReturnLine } from './sales-return-line.entity.js';
import { CustomerRefund } from './customer-refund.entity.js';
import type { Relation } from 'typeorm';

@Entity('sales_returns')
export class SalesReturn {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  returnNumber!: string;

  @Column()
  invoiceId!: number;

  @ManyToOne(() => SalesInvoice, (invoice) => invoice.returns, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Relation<SalesInvoice>;

  @Column()
  customerId!: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer!: Relation<Customer>;

  @Column({ type: 'date' })
  returnDate!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalReturnAmountKd!: number | string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  outstandingReductionKd!: number | string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  refundRequiredKd!: number | string;

  @Column({ default: 0 })
  totalReturnPcs!: number;

  @Column({ length: 50, default: 'CUSTOMER_RETURN' })
  returnReason!: string;

  @Column({ length: 500, nullable: true })
  notes?: string;

  @Column({ length: 20, default: 'POSTED' })
  status!: string;

  @Column({ length: 100 })
  createdBy!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => SalesReturnLine, (line) => line.salesReturn)
  lines!: Relation<SalesReturnLine>[];

  @OneToMany(() => CustomerRefund, (refund) => refund.salesReturn)
  refunds!: Relation<CustomerRefund>[];
}
