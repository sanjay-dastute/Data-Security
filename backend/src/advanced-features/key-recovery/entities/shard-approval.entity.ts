import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shard_approvals')
export class ShardApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shard_id: string;

  @Column()
  requester_id: string;

  @Column()
  requester_name: string;

  @Column({ nullable: true })
  approver_id: string;

  @Column({ nullable: true })
  approver_name: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;
}
