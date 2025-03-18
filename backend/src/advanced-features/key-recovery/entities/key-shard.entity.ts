import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum KeyShardStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('key_shards')
export class KeyShard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'key_id' })
  key_id: string;

  @Column({ name: 'recovery_id' })
  recovery_id: string;

  @Column({ name: 'shard_index' })
  shard_index: number;

  @Column({ name: 'shard_data', type: 'text' })
  shard_data: string;

  @Column({ name: 'threshold', default: 3 })
  threshold: number;

  @Column({
    type: 'enum',
    enum: KeyShardStatus,
    default: KeyShardStatus.PENDING,
  })
  status: KeyShardStatus;

  @Column({ name: 'created_by' })
  created_by: string;

  @Column({ name: 'custodian_id', nullable: true })
  custodian_id: string;

  @Column({ name: 'custodian_email', nullable: true })
  custodian_email: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
