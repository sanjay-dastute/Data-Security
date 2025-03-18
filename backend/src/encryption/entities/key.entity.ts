import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum KeyAlgorithm {
  AES_256_GCM = 'AES-256-GCM',
  RSA_4096 = 'RSA-4096',
  ECDSA_P384 = 'ECDSA-P384',
  KYBER_768 = 'KYBER-768',
  DILITHIUM_3 = 'DILITHIUM-3',
}

@Entity('keys')
export class Key {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, default: 'Encryption Key' })
  name: string;

  @Column({
    type: 'enum',
    enum: KeyAlgorithm,
    default: KeyAlgorithm.AES_256_GCM,
  })
  algorithm: KeyAlgorithm;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ name: 'organization_id', nullable: true })
  organization_id: string;

  @Column({ name: 'key_material', type: 'text', nullable: false })
  key_material: string;

  @Column({ name: 'is_hsm_backed', default: false })
  is_hsm_backed: boolean;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'is_revoked', default: false })
  is_revoked: boolean;

  @Column({ name: 'revocation_reason', nullable: true })
  revocation_reason: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ name: 'last_rotated_at', type: 'timestamp', nullable: true })
  last_rotated_at: Date;

  @Column({ name: 'rotation_period', type: 'int', default: 30 })
  rotation_period: number;

  @Column({ name: 'type', default: 'encryption' })
  type: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true, default: '{}' })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
