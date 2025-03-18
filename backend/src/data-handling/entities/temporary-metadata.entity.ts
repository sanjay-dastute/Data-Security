import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';

@Entity()
export class TemporaryMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  file_id: string;

  @Column()
  file_name: string;

  @Column({ type: 'text' })
  metadata: string; // Store JSON as string for SQLite compatibility

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  is_processed: boolean;

  @Column({ default: 3600 }) // Default 1 hour TTL
  ttl_seconds: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
