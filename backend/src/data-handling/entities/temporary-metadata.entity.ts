import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('temporary_metadata')
export class TemporaryMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

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
  originalName: string;

  @Column({ nullable: true })
  fileType: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  recordCount: number;

  @Column({ nullable: true, type: 'text' })
  fields: string;

  @Column({ nullable: true, type: 'text' })
  sampleData: string;

  @Column({ nullable: true })
  processed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
