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
import { CustomerReceipt } from './customer-receipt.entity.js';
import { Customer } from './customer.entity.js';
import { SalesInvoice } from './sales-invoice.entity.js';

export type AllocationType = 'OPENING_BALANCE' | 'INVOICE';

@Entity('customer_receipt_allocations')
export class CustomerReceiptAllocation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int' })
  receiptId!: number;

  @ManyToOne(() => CustomerReceipt, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'receiptId' })
  receipt?: Relation<CustomerReceipt>;

  @Index()
  @Column({ type: 'int' })
  customerId!: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer?: Relation<Customer>;

  @Column({ type: 'varchar', length: 50 })
  allocationType!: AllocationType;

  @Column({ type: 'int', nullable: true })
  invoiceId?: number;

  @ManyToOne(() => SalesInvoice, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Relation<SalesInvoice>;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amountKd!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
