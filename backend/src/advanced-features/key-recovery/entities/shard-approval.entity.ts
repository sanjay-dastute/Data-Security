import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('shard_approvals')
export class ShardApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shard_id' })
  shard_id: string;

  @Column({ name: 'custodian_id' })
  custodian_id: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ name: 'rejection_reason', nullable: true })
  rejection_reason: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
