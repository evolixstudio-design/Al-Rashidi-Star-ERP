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

@Entity('customer_opening_balance_adjustments')
export class CustomerOpeningBalanceAdjustment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Index()
  @Column({ type: 'int' })
  customerId!: number;

  @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customerId' })
  customer?: Relation<Customer>;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amountKd!: number;

  @Column({ type: 'varchar', length: 500 })
  reason!: string;

  @Column({ type: 'varchar', length: 100 })
  performedBy!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
