import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Key } from '../../../encryption/entities/key.entity';

@Entity('key_shards')
export class KeyShard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key_id: string;

  @ManyToOne(() => Key, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'key_id' })
  key: Key;

  @Column()
  holder_name: string;

  @Column()
  holder_email: string;

  @Column()
  encrypted_shard: string;

  @Column()
  index: number;

  @CreateDateColumn()
  created_at: Date;
}
