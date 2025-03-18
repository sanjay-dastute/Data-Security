import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';

export enum KeyType {
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  MASTER = 'master',
  RECOVERY = 'recovery',
  SYMMETRIC = 'symmetric',
}

export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPROMISED = 'COMPROMISED',
  EXPIRED = 'EXPIRED',
  RECOVERY_PENDING = 'RECOVERY_PENDING',
}

export enum KeyAlgorithm {
  RSA = 'RSA',
  ECC = 'ECC',
  AES = 'AES',
  CHACHA20 = 'CHACHA20',
  KYBER = 'KYBER',
  DILITHIUM = 'DILITHIUM',
  FALCON = 'FALCON',
}

@Entity('keys')
export class Key {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
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

  @Column({ nullable: true, type: 'text' })
  key_material: string;

  @Column({
    type: 'enum',
    enum: KeyStatus,
    default: KeyStatus.ACTIVE,
  })
  status: KeyStatus;

  @Column({
    type: 'enum',
    enum: KeyAlgorithm,
    default: KeyAlgorithm.AES,
    nullable: true,
  })
  algorithm: KeyAlgorithm;

  @Column({ nullable: true })
  key_size: number;

  @Column({ default: false })
  is_quantum_resistant: boolean;

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

  get shard_threshold(): number {
    return this.threshold;
  }

  @Column({ default: 0 })
  timer_interval: number;

  @Column({ default: false })
  hsm_backed: boolean;

  @Column({ nullable: true })
  hsm_slot_id: string;

  @Column({ nullable: true })
  public_key: string;
}
