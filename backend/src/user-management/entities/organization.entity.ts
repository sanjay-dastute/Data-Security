import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  api_key: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  subscription_plan: string;

  @Column({ nullable: true })
  subscription_expiry: Date;

  @Column({ nullable: true })
  admin_user_id: string;

  @Column({ type: 'json', nullable: true })
  settings: {
    key_timer?: number;
    storage_config?: {
      provider: string;
      credentials: Record<string, string>;
      bucket?: string;
      container?: string;
      endpoint?: string;
    };
    encryption_defaults?: {
      algorithm: string;
      key_size: number;
      use_hsm: boolean;
    };
    notification_settings?: {
      email_alerts: boolean;
      webhook_url?: string;
    };
  };

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
