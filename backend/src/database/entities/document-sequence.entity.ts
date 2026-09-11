import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('document_sequences')
export class DocumentSequence {
  @PrimaryColumn({ length: 50 })
  id!: string; // e.g., 'SALES_RETURN:2026', 'CUSTOMER_REFUND:2026'

  @Column({ default: 1 })
  nextValue!: number;
}
