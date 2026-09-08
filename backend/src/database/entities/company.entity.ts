import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'name_en', length: 255, default: 'Rashidi Traders' })
  nameEn: string;

  @Column({ type: 'varchar', name: 'name_ar', length: 255, default: 'شركة الرشيدي للتجارة' })
  nameAr: string;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: 'text', name: 'logo_url', nullable: true })
  logoUrl?: string | null;

  @Column({ type: 'text', name: 'invoice_terms_en', nullable: true })
  invoiceTermsEn?: string | null;

  @Column({ type: 'text', name: 'invoice_terms_ar', nullable: true })
  invoiceTermsAr?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
