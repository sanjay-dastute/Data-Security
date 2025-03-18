import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
