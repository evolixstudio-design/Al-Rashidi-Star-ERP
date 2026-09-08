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
import { Supplier } from './supplier.entity.js';
import { PurchaseLine } from './purchase-line.entity.js';

@Entity('purchase_receipts')
export class PurchaseReceipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  receiptNumber!: string;

  @Column({ type: 'int', nullable: true })
  supplierId?: number | null;

  @ManyToOne(() => Supplier, (s) => s.purchases, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier?: Relation<Supplier> | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipmentContainerNo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierInvoiceRef?: string;

  @Column({ type: 'date' })
  receiptDate!: string;

  @Column({ type: 'int', default: 0 })
  totalPcs!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  totalAmountKd!: number;

  @Column({ type: 'varchar', length: 30, default: 'COMPLETED' })
  status!: string;

  @Column({ type: 'varchar', length: 100 })
  receivedBy!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string;

  @OneToMany(() => PurchaseLine, (line) => line.receipt, { cascade: true })
  lines?: Relation<PurchaseLine>[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
