import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_USER = 'ORG_USER',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'simple-json',
    nullable: true,
    default: '[]'
  })
  approved_addresses: { ip: string; mac: string }[];

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.ORG_USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ default: false })
  is_active: boolean;

  @Column({
    type: 'simple-enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approval_status: ApprovalStatus | string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
