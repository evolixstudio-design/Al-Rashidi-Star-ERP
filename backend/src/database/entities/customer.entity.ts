import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { SalesInvoice } from './sales-invoice.entity.js';
import { CustomerReceipt } from './customer-receipt.entity.js';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  nameAr?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalSales!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalReceived!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalOutstanding!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  openingBalanceOriginalKd!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  openingOutstandingKd!: number;

  @Column({ type: 'date', nullable: true })
  openingBalanceDate?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  openingBalanceNote?: string;

  @OneToMany(() => SalesInvoice, (inv) => inv.customer)
  invoices?: Relation<SalesInvoice>[];

  @OneToMany(() => CustomerReceipt, (r) => r.customer)
  receipts?: Relation<CustomerReceipt>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
