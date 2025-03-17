import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum UserRole {
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  ORG_USER = 'org_user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ORG_USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, organization => organization.users, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'json', default: {} })
  permissions: Record<string, boolean>;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ type: 'json', default: {} })
  details: Record<string, any>;

  @Column({ type: 'json', default: [] })
  approved_addresses: Array<{ ip: string; mac: string }>;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  approvalStatus: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
