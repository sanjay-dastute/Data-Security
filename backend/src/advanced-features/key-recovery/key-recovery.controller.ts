import { Controller, Get, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { KeyRecoveryService } from './key-recovery.service';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import { RequestShardApprovalDto, VerifyMfaDto } from './dto/key-recovery.dto';
import { Request } from 'express';

@Controller('keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KeyRecoveryController {
  constructor(
    private readonly keyRecoveryService: KeyRecoveryService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get(':keyId/shards')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async getKeyShards(@Param('keyId') keyId: string, @Req() req: Request) {
    try {
      return await this.keyRecoveryService.getKeyShards(keyId, req.user['userId']);
    } catch (error) {
      throw new BadRequestException(`Failed to get key shards: ${error.message}`);
    }
  }

  @Get(':keyId/shards/approvals')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async getShardApprovals(@Param('keyId') keyId: string, @Req() req: Request) {
    try {
      return await this.keyRecoveryService.getShardApprovals(keyId, req.user['userId']);
    } catch (error) {
      throw new BadRequestException(`Failed to get shard approvals: ${error.message}`);
    }
  }

  @Post(':keyId/shards/:shardId/request-approval')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async requestShardApproval(
    @Param('keyId') keyId: string,
    @Param('shardId') shardId: string,
    @Req() req: Request,
  ) {
    try {
      const result = await this.keyRecoveryService.requestShardApproval(keyId, shardId, req.user['userId']);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: keyId,
        user_id: req.user['userId'],
        event_type: 'recovery_requested',
        timestamp: new Date(),
        metadata: {
          shard_id: shardId,
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to request shard approval: ${error.message}`);
    }
  }

  @Post(':keyId/shards/:shardId/approve')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async approveShard(
    @Param('keyId') keyId: string,
    @Param('shardId') shardId: string,
    @Req() req: Request,
  ) {
    try {
      const result = await this.keyRecoveryService.approveShard(keyId, shardId, req.user['userId']);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: keyId,
        user_id: req.user['userId'],
        event_type: 'recovery_approved',
        timestamp: new Date(),
        metadata: {
          shard_id: shardId,
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to approve shard: ${error.message}`);
    }
  }

  @Post(':keyId/recover')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async recoverKey(
    @Param('keyId') keyId: string,
    @Req() req: Request,
  ) {
    try {
      const result = await this.keyRecoveryService.recoverKey(keyId, req.user['userId']);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: keyId,
        user_id: req.user['userId'],
        event_type: 'recovered',
        timestamp: new Date(),
        metadata: {
          recovery_method: 'shamir',
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to recover key: ${error.message}`);
    }
  }
}
