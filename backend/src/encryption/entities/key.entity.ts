import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';

export enum KeyType {
  ENCRYPTION = 'encryption',
  SIGNATURE = 'signature',
}

export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPROMISED = 'COMPROMISED',
  EXPIRED = 'EXPIRED',
  RECOVERY_PENDING = 'RECOVERY_PENDING',
}

@Entity('keys')
export class Key {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'key_id', nullable: true })
  key_id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  organization_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({
    type: 'enum',
    enum: KeyType,
    default: KeyType.ENCRYPTION,
  })
  key_type: KeyType;

  @Column()
  key_data: string;

  @Column({
    type: 'enum',
    enum: KeyStatus,
    default: KeyStatus.ACTIVE,
  })
  status: KeyStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  last_used: Date;

  @Column({ type: 'json', nullable: true })
  shards: Record<string, string>;

  @Column({ nullable: true })
  threshold: number;

  @Column({ default: 0 })
  timer_interval: number;
}
