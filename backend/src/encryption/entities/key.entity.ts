import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Key {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  organizationId: string;

  @Column()
  algorithm: string;

  @Column({ type: 'text' })
  encryptedKey: string;

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON string for SQLite compatibility

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  rotationDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ nullable: true })
  previousKeyId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
