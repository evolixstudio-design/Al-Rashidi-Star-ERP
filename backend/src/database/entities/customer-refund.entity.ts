import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesReturn } from './sales-return.entity.js';
import { Customer } from './customer.entity.js';
import type { Relation } from 'typeorm';

@Entity('customer_refunds')
export class CustomerRefund {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  refundNumber!: string;

  @Column()
  salesReturnId!: number;

  @ManyToOne(() => SalesReturn, (salesReturn) => salesReturn.refunds, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'salesReturnId' })
  salesReturn!: Relation<SalesReturn>;

  @Column()
  customerId!: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer!: Relation<Customer>;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amountKd!: number | string;

  @Column({ length: 50, default: 'CASH' })
  refundMethod!: string;

  @Column({ type: 'date' })
  refundDate!: string;

  @Column({ length: 500, nullable: true })
  notes?: string;

  @Column({ length: 20, default: 'POSTED' })
  status!: string;

  @Column({ length: 100 })
  performedBy!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
