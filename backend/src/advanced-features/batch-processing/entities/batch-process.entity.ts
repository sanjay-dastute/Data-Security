import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BatchProcessStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('batch_processes')
export class BatchProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  organization_id: string;

  @Column('simple-json')
  file_ids: string[];

  @Column('simple-json')
  fields: string[];

  @Column()
  key_id: string;

  @Column('simple-json')
  storage_config: {
    type: string;
    bucketName?: string;
    region?: string;
    path?: string;
    connectionString?: string;
    tableName?: string;
    endpoint?: string;
  };

  @Column({ default: 4 })
  parallel_processes: number;

  @Column({
    type: 'enum',
    enum: BatchProcessStatus,
    default: BatchProcessStatus.PENDING,
  })
  status: BatchProcessStatus;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: 0 })
  processed_files: number;

  @Column()
  total_files: number;

  @Column({ nullable: true })
  error_message: string;

  @Column('simple-json', { nullable: true })
  results: {
    fileId: string;
    fileName: string;
    status: string;
    encryptedFileUrl?: string;
    errorMessage?: string;
  }[];

  @Column({ nullable: true })
  estimated_time_remaining: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completed_at: Date;
}
