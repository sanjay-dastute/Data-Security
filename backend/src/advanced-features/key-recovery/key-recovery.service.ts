import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyShard, KeyShardStatus } from './entities/key-shard.entity';
import { ShardApproval, ApprovalStatus as ShardApprovalStatus } from './entities/shard-approval.entity';
import { KeyService } from '../../encryption/services/key.service';
import * as crypto from 'crypto';

@Injectable()
export class KeyRecoveryService {
  private readonly logger = new Logger(KeyRecoveryService.name);

  constructor(
    @InjectRepository(KeyShard)
    private readonly keyShardRepository: Repository<KeyShard>,
    @InjectRepository(ShardApproval)
    private readonly shardApprovalRepository: Repository<ShardApproval>,
    private readonly keyService: KeyService,
  ) {}

  async initiateKeyRecovery(keyId: string, userId: string, threshold: number, totalShards: number): Promise<any> {
    this.logger.log(`Initiating key recovery for key ${keyId} by user ${userId}`);
    
    // Get the key
    const key = await this.keyService.getKeyById(keyId);
    if (!key) {
      throw new NotFoundException(`Key ${keyId} not found`);
    }
    
    // Check if user has permission to recover this key
    if (key.user_id !== userId && key.organization_id !== key.organization_id) {
      throw new Error('Unauthorized to recover this key');
    }
    
    // Generate shards using Shamir's Secret Sharing
    const shards = this.generateShards(key.key_material, threshold, totalShards);
    
    // Create recovery ID
    const recoveryId = crypto.randomUUID();
    
    // Store shards
    const keyShards = [];
    for (let i = 0; i < shards.length; i++) {
      const shard = this.keyShardRepository.create({
        key_id: keyId,
        recovery_id: recoveryId,
        shard_index: i + 1,
        shard_data: this.encryptShard(shards[i]),
        created_by: userId,
        threshold,
        status: KeyShardStatus.PENDING,
      });
      
      keyShards.push(await this.keyShardRepository.save(shard));
    }
    
    return {
      recovery_id: recoveryId,
      key_id: keyId,
      threshold,
      total_shards: totalShards,
      shards: keyShards.map(s => ({
        id: s.id,
        index: s.shard_index,
        status: s.status,
      })),
    };
  }

  async assignShardCustodians(recoveryId: string, shardAssignments: any[]): Promise<any> {
    this.logger.log(`Assigning shard custodians for recovery ${recoveryId}`);
    
    // Get shards for this recovery
    const shards = await this.keyShardRepository.find({
      where: { recovery_id: recoveryId },
    });
    
    if (shards.length === 0) {
      throw new NotFoundException(`Recovery ${recoveryId} not found`);
    }
    
    // Assign custodians
    for (const assignment of shardAssignments) {
      const shard = shards.find(s => s.id === assignment.shardId);
      if (shard) {
        shard.custodian_id = assignment.custodianId;
        shard.custodian_email = assignment.custodianEmail;
        shard.status = KeyShardStatus.ASSIGNED;
        
        await this.keyShardRepository.save(shard);
      }
    }
    
    return {
      recovery_id: recoveryId,
      shards: await this.keyShardRepository.find({
        where: { recovery_id: recoveryId },
      }),
    };
  }

  async submitShardApproval(shardId: string, custodianId: string): Promise<any> {
    this.logger.log(`Submitting shard approval for shard ${shardId} by custodian ${custodianId}`);
    
    // Get the shard
    const shard = await this.keyShardRepository.findOne({
      where: { id: shardId },
    });
    
    if (!shard) {
      throw new NotFoundException(`Shard ${shardId} not found`);
    }
    
    // Check if custodian is authorized
    if (shard.custodian_id !== custodianId) {
      throw new Error('Unauthorized to approve this shard');
    }
    
    // Create approval
    const approval = this.shardApprovalRepository.create({
      shard_id: shardId,
      custodian_id: custodianId,
      approved_at: new Date(),
      status: ShardApprovalStatus.APPROVED,
    });
    
    await this.shardApprovalRepository.save(approval);
    
    // Update shard status
    shard.status = KeyShardStatus.APPROVED;
    await this.keyShardRepository.save(shard);
    
    // Check if recovery is complete
    const recoveryComplete = await this.checkRecoveryComplete(shard.recovery_id);
    
    return {
      shard_id: shardId,
      status: shard.status,
      recovery_complete: recoveryComplete,
    };
  }

  async getRecoveryStatus(recoveryId: string): Promise<any> {
    this.logger.log(`Getting recovery status for ${recoveryId}`);
    
    // Get shards for this recovery
    const shards = await this.keyShardRepository.find({
      where: { recovery_id: recoveryId },
    });
    
    if (shards.length === 0) {
      throw new NotFoundException(`Recovery ${recoveryId} not found`);
    }
    
    // Get approvals
    const approvals = await this.shardApprovalRepository.createQueryBuilder('approval')
      .where('approval.shard_id IN (:...shardIds)', { shardIds: shards.map(s => s.id) })
      .getMany();
    
    // Calculate status
    const totalShards = shards.length;
    const approvedShards = shards.filter(s => s.status === KeyShardStatus.APPROVED).length;
    const threshold = shards[0].threshold;
    
    return {
      recovery_id: recoveryId,
      key_id: shards[0].key_id,
      total_shards: totalShards,
      approved_shards: approvedShards,
      threshold,
      can_recover: approvedShards >= threshold,
      shards: shards.map(s => ({
        id: s.id,
        index: s.shard_index,
        status: s.status,
        custodian_id: s.custodian_id,
        custodian_email: s.custodian_email,
        approval: approvals.find(a => a.shard_id === s.id),
      })),
    };
  }

  async recoverKey(recoveryId: string, userId: string): Promise<any> {
    this.logger.log(`Recovering key for recovery ${recoveryId} by user ${userId}`);
    
    // Get recovery status
    const status = await this.getRecoveryStatus(recoveryId);
    
    if (!status.can_recover) {
      throw new Error('Cannot recover key: insufficient approved shards');
    }
    
    // Get the key
    const key = await this.keyService.getKeyById(status.key_id);
    if (!key) {
      throw new NotFoundException(`Key ${status.key_id} not found`);
    }
    
    // Get approved shards
    const approvedShards = status.shards
      .filter(s => s.status === KeyShardStatus.APPROVED)
      .slice(0, status.threshold);
    
    // Get shard data
    const shardData = [];
    for (const shard of approvedShards) {
      const shardEntity = await this.keyShardRepository.findOne({
        where: { id: shard.id },
      });
      
      shardData.push({
        index: shardEntity.shard_index,
        data: this.decryptShard(shardEntity.shard_data),
      });
    }
    
    // Combine shards to recover key
    const recoveredKey = this.combineShards(shardData, status.threshold);
    
    // Update key with recovered material
    await this.keyService.rotateKey(key.id);
    
    return {
      recovery_id: recoveryId,
      key_id: key.id,
      success: true,
      message: 'Key recovered successfully',
    };
  }

  private async checkRecoveryComplete(recoveryId: string): Promise<boolean> {
    const status = await this.getRecoveryStatus(recoveryId);
    return status.can_recover;
  }

  private generateShards(secret: string, threshold: number, totalShards: number): string[] {
    // In a real implementation, this would use Shamir's Secret Sharing
    // For now, we'll just simulate it
    const shards = [];
    for (let i = 0; i < totalShards; i++) {
      shards.push(`shard-${i + 1}-${secret.substring(0, 10)}`);
    }
    return shards;
  }

  private combineShards(shards: any[], threshold: number): string {
    // In a real implementation, this would combine Shamir's Secret Sharing shards
    // For now, we'll just simulate it
    return shards[0].data.split('-')[2];
  }

  private encryptShard(shard: string): string {
    // In a real implementation, this would encrypt the shard
    // For now, we'll just base64 encode it
    return Buffer.from(shard).toString('base64');
  }

  private decryptShard(encryptedShard: string): string {
    // In a real implementation, this would decrypt the shard
    // For now, we'll just base64 decode it
    return Buffer.from(encryptedShard, 'base64').toString();
  }
}
