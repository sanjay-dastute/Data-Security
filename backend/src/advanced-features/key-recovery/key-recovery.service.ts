import { Injectable, Logger, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key, KeyStatus } from '../../encryption/entities/key.entity';
import { KeyShard } from './entities/key-shard.entity';
import { ShardApproval } from './entities/shard-approval.entity';
import { ShamirService } from './shamir.service';
import { EmailService } from '../../auth/services/email.service';
import { UserService } from '../../user-management/services/user.service';
import { UserRole } from '../../user-management/entities/user.entity';

@Injectable()
export class KeyRecoveryService {
  private readonly logger = new Logger(KeyRecoveryService.name);

  constructor(
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
    @InjectRepository(KeyShard)
    private readonly keyShardRepository: Repository<KeyShard>,
    @InjectRepository(ShardApproval)
    private readonly shardApprovalRepository: Repository<ShardApproval>,
    private readonly shamirService: ShamirService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async getKeyShards(keyId: string, userId: string): Promise<any> {
    try {
      // Check if key exists
      const key = await this.keyRepository.findOne({ where: { id: keyId } as any });
      if (!key) {
        throw new NotFoundException(`Key with ID ${keyId} not found`);
      }

      // Check if user has access to the key
      if (key.organization_id) {
        const user = await this.userService.findOne(userId);
        if (user.organization_id !== key.organization_id && user.role !== UserRole.ADMIN) {
          throw new UnauthorizedException('You do not have access to this key');
        }
      }

      // Get key shards
      const shards = await this.keyShardRepository.find({
        where: { key_id: keyId },
        select: ['id', 'key_id', 'holder_name', 'holder_email', 'index', 'created_at'],
      });

      return {
        shards,
        key_name: key.name || 'Unknown',
        created_by: key.created_by || 'Unknown',
        created_at: key.created_at,
        threshold: key.threshold || Math.ceil(shards.length / 2),
      };
    } catch (error) {
      this.logger.error(`Failed to get key shards: ${error.message}`);
      throw error;
    }
  }

  async getShardApprovals(keyId: string, userId: string): Promise<any> {
    try {
      // Check if key exists
      const key = await this.keyRepository.findOne({ where: { id: keyId } as any });
      if (!key) {
        throw new NotFoundException(`Key with ID ${keyId} not found`);
      }

      // Check if user has access to the key
      if (key.organization_id) {
        const user = await this.userService.findOne(userId);
        if (user.organization_id !== key.organization_id && user.role !== UserRole.ADMIN) {
          throw new UnauthorizedException('You do not have access to this key');
        }
      }

      // Get key shards
      const shards = await this.keyShardRepository.find({
        where: { key_id: keyId },
      });

      // Get shard approvals
      const approvals = await Promise.all(
        shards.map(async (shard) => {
          const approval = await this.shardApprovalRepository.findOne({
            where: { shard_id: shard.id } as any,
            order: { created_at: 'DESC' } as any,
          });

          return {
            id: shard.id,
            approved: approval?.status === 'approved',
            requested: !!approval,
            approver: approval?.approver_name || '',
            timestamp: approval?.created_at || null,
          };
        })
      );

      return {
        approvals,
        threshold: key.threshold || Math.ceil(shards.length / 2),
      };
    } catch (error) {
      this.logger.error(`Failed to get shard approvals: ${error.message}`);
      throw error;
    }
  }

  async requestShardApproval(keyId: string, shardId: string, userId: string): Promise<any> {
    try {
      // Check if key exists
      const key = await this.keyRepository.findOne({ where: { id: keyId } as any });
      if (!key) {
        throw new NotFoundException(`Key with ID ${keyId} not found`);
      }

      // Check if shard exists
      const shard = await this.keyShardRepository.findOne({ where: { id: shardId, key_id: keyId } as any });
      if (!shard) {
        throw new NotFoundException(`Shard with ID ${shardId} not found for key ${keyId}`);
      }

      // Check if user has access to the key
      if (key.organization_id) {
        const user = await this.userService.findOne(userId);
        if (user.organization_id !== key.organization_id && user.role !== UserRole.ADMIN) {
          throw new UnauthorizedException('You do not have access to this key');
        }
      }

      // Create approval request
      const approval = this.shardApprovalRepository.create({
        shard_id: shardId,
        requester_id: userId,
        requester_name: (await this.userService.findOne(userId)).username,
        status: 'pending',
      });

      await this.shardApprovalRepository.save(approval);

      // Send email to shard holder
      await this.emailService.sendShardApprovalRequest(
        shard.holder_email,
        shard.holder_name,
        key.name,
        approval.id,
      );

      return {
        message: `Approval request sent to ${shard.holder_name} (${shard.holder_email})`,
        approval_id: approval.id,
      };
    } catch (error) {
      this.logger.error(`Failed to request shard approval: ${error.message}`);
      throw error;
    }
  }

  async approveShard(keyId: string, shardId: string, userId: string): Promise<any> {
    try {
      // Check if key exists
      const key = await this.keyRepository.findOne({ where: { id: keyId } as any });
      if (!key) {
        throw new NotFoundException(`Key with ID ${keyId} not found`);
      }

      // Check if shard exists
      const shard = await this.keyShardRepository.findOne({ where: { id: shardId, key_id: keyId } as any });
      if (!shard) {
        throw new NotFoundException(`Shard with ID ${shardId} not found for key ${keyId}`);
      }

      // Check if user is the shard holder
      const user = await this.userService.findOne(userId);
      if (user.email !== shard.holder_email) {
        throw new UnauthorizedException('You are not authorized to approve this shard');
      }

      // Get the latest approval request
      const approval = await this.shardApprovalRepository.findOne({
        where: { shard_id: shardId } as any,
        order: { created_at: 'DESC' } as any,
      });

      if (!approval) {
        throw new NotFoundException(`No approval request found for shard ${shardId}`);
      }

      if (approval.status !== 'pending') {
        throw new BadRequestException(`Approval request is already ${approval.status}`);
      }

      // Update approval status
      approval.status = 'approved';
      approval.approver_id = userId;
      approval.approver_name = user.username;
      approval.approved_at = new Date();

      await this.shardApprovalRepository.save(approval);

      return {
        message: `Shard ${shardId} approved successfully`,
        approval_id: approval.id,
      };
    } catch (error) {
      this.logger.error(`Failed to approve shard: ${error.message}`);
      throw error;
    }
  }

  async recoverKey(keyId: string, userId: string): Promise<any> {
    try {
      // Check if key exists
      const key = await this.keyRepository.findOne({ where: { id: keyId } as any });
      if (!key) {
        throw new NotFoundException(`Key with ID ${keyId} not found`);
      }

      // Check if user has access to the key
      if (key.organization_id) {
        const user = await this.userService.findOne(userId);
        if (user.organization_id !== key.organization_id && user.role !== UserRole.ADMIN) {
          throw new UnauthorizedException('You do not have access to this key');
        }
      }

      // Get key shards
      const shards = await this.keyShardRepository.find({
        where: { key_id: keyId },
      });

      // Get approved shards
      const approvedShards = [];
      for (const shard of shards) {
        const approval = await this.shardApprovalRepository.findOne({
          where: { shard_id: shard.id } as any,
          order: { created_at: 'DESC' } as any,
        });

        if (approval && approval.status === 'approved') {
          approvedShards.push({
            index: shard.index,
            value: shard.encrypted_shard,
          });
        }
      }

      // Calculate threshold if not defined
      const threshold = key.threshold || Math.ceil(shards.length / 2);

      // Check if we have enough shards
      if (approvedShards.length < threshold) {
        throw new BadRequestException(
          `Not enough approved shards. Need ${threshold}, have ${approvedShards.length}`,
        );
      }

      // Recover the key using Shamir's Secret Sharing
      const recoveredKey = this.shamirService.combineShards(approvedShards, threshold);

      // Update key status
      key.status = KeyStatus.ACTIVE;
      key.updated_by = userId;

      await this.keyRepository.save(key);

      return {
        id: key.id,
        name: key.name || 'Unknown',
        created_by: key.created_by || 'Unknown',
        created_at: key.created_at,
        status: key.status,
        message: 'Key recovered successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to recover key: ${error.message}`);
      throw error;
    }
  }
}
