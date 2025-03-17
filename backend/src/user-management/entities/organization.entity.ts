import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  organization_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  admin_user_id: string;

  @Column({ type: 'json', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'json', default: {} })
  profile: Record<string, any>;

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
