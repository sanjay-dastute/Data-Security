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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
