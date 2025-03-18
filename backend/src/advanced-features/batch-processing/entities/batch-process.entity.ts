import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BatchProcessStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BatchProcessType {
  ENCRYPTION = 'encryption',
  DECRYPTION = 'decryption',
  KEY_ROTATION = 'key_rotation',
  DATA_IMPORT = 'data_import',
  DATA_EXPORT = 'data_export',
}

@Entity('batch_processes')
export class BatchProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'organization_id', nullable: true })
  organization_id: string;

  @Column({ name: 'total_items', default: 0 })
  total_items: number;

  @Column({ name: 'processed_items', default: 0 })
  processed_items: number;

  @Column({ name: 'success_count', default: 0 })
  success_count: number;

  @Column({ name: 'failure_count', default: 0 })
  failure_count: number;

  @Column({
    name: 'process_type',
    type: 'enum',
    enum: BatchProcessType,
    default: BatchProcessType.ENCRYPTION,
  })
  process_type: BatchProcessType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BatchProcessStatus,
    default: BatchProcessStatus.QUEUED,
  })
  status: BatchProcessStatus;

  @Column({ name: 'error_message', nullable: true })
  error_message: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
