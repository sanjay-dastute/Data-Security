import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';

@Entity('temporary_metadata')
export class TemporaryMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  data_id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  organization_id: string;

  @Column()
  session_id: string;

  @Column({ type: 'text' })
  metadata: string;

  @Column({ default: false })
  is_processed: boolean;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ nullable: true })
  original_name: string;

  @Column({ nullable: true })
  file_type: string;

  @Column({ nullable: true })
  file_path: string;

  @Column({ nullable: true })
  file_name: string;

  @Column({ nullable: true })
  file_size: number;

  @Column({ nullable: true })
  record_count: number;

  @Column({ nullable: true, type: 'text' })
  fields: string;

  @Column({ nullable: true, type: 'text' })
  sample_data: string;

  @Column({ nullable: true })
  processed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'json', default: [] })
  fields_encrypted: string[];

  @Column({ nullable: true })
  self_destruct_script: string;

  @Column({ nullable: true })
  encrypted_file_path: string;

  @Column({ type: 'json', default: {} })
  storage_config: Record<string, any>;
}
