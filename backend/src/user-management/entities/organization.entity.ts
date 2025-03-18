import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
