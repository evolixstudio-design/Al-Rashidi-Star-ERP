import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  expenseNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amountKd!: number;

  @Index()
  @Column({ type: 'date' })
  expenseDate!: string;

  @Column({ type: 'varchar', length: 50, default: 'Cash' })
  paymentMethod!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  paidTo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiptRef?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100 })
  recordedBy!: string;

  @Column({ type: 'varchar', length: 50, default: 'POSTED' })
  status!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cancellationReason?: string;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cancelledBy?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
