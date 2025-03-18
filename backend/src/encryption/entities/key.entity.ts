import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';
import { Organization } from '../../user-management/entities/organization.entity';

export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

@Entity()
export class Key {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  encrypted_key: string;

  @Column({ type: 'text', nullable: true })
  public_key: string;

  @Column({
    type: 'simple-enum',
    enum: KeyStatus,
    default: KeyStatus.ACTIVE
  })
  status: KeyStatus;

  @Column({ nullable: true })
  expiration_time: Date;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'text', nullable: true })
  metadata: string; // Store JSON as string for SQLite compatibility

  @Column({ nullable: true })
  blockchain_reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
