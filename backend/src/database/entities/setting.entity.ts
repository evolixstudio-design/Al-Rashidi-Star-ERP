import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 100 })
  key: string;

  @Column({ type: 'jsonb', nullable: true })
  value: any;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
