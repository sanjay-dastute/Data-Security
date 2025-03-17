import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';

@Entity('temporary_metadata')
export class TemporaryMetadata {
  @PrimaryGeneratedColumn('uuid')
  data_id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  file_name: string;

  @Column()
  file_type: string;

  @Column({ nullable: true })
  encrypted_file_path: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'json', default: [] })
  fields_encrypted: string[];

  @Column({ nullable: true })
  self_destruct_script: string;

  @Column({ type: 'json', default: {} })
  storage_config: Record<string, any>;
}
