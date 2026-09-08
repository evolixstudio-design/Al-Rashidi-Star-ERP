import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ type: 'varchar', name: 'entity_id', length: 100, nullable: true })
  entityId?: string | null;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: any;

  @Column({ type: 'varchar', name: 'performed_by', length: 100 })
  performedBy: string;

  @CreateDateColumn({ name: 'performed_at' })
  performedAt: Date;
}
