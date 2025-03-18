import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum KeyType {
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  MASTER = 'master',
  RECOVERY = 'recovery',
}

export enum KeyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  COMPROMISED = 'compromised',
}

export enum KeyAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  RSA_4096 = 'rsa-4096',
  ED25519 = 'ed25519',
  KYBER_1024 = 'kyber-1024',
  DILITHIUM_5 = 'dilithium-5',
}

@Entity('encryption_keys')
export class Key {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  organization_id: string;

  @Column()
  key_id: string;

  @Column({ type: 'text' })
  encrypted_key: string;

  @Column({ nullable: true })
  key_hash: string;

  @Column({
    type: 'simple-enum',
    enum: KeyStatus,
    default: KeyStatus.ACTIVE
  })
  status: KeyStatus;

  @Column({
    type: 'simple-enum',
    enum: KeyType,
    default: KeyType.ENCRYPTION
  })
  type: KeyType;

  @Column({
    type: 'simple-enum',
    enum: KeyAlgorithm,
    default: KeyAlgorithm.AES_256_GCM
  })
  algorithm: KeyAlgorithm;

  @Column({ default: 256 })
  key_size: number;

  @Column({ nullable: true })
  expiry_date: Date;

  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ nullable: true, type: 'simple-json' })
  metadata: any;

  @Column({ default: false })
  is_recovery_key: boolean;

  @Column({ default: false })
  is_hsm_backed: boolean;

  @Column({ nullable: true })
  hsm_key_id: string;

  @Column({ nullable: true })
  hsm_provider: string;

  @Column({ default: false })
  is_master_key: boolean;

  @Column({ default: true })
  is_exportable: boolean;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ nullable: true })
  last_used: Date;

  @Column({ nullable: true })
  last_rotation_date: Date;

  @Column({ nullable: true })
  rotation_period: number;

  @Column({ nullable: true })
  previousKeyId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
