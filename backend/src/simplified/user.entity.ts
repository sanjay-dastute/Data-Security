import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_USER = 'ORG_USER',
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
    type: 'enum',
    enum: UserRole,
    default: UserRole.ORG_USER,
  })
  role: UserRole;

  @Column({ default: false })
  is_activated: boolean;

  @Column({ nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, organization => organization.users)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column('jsonb', { default: [] })
  approved_addresses: { ip: string; mac: string }[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
