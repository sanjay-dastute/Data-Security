import { Controller, Post, Body, UseGuards, Req, Param, Get, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { KeyRecoveryService } from './key-recovery.service';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Controller('key-recovery')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KeyRecoveryController {
  constructor(private readonly keyRecoveryService: KeyRecoveryService) {}

  @Post('initiate')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async initiateRecovery(@Body() initiateDto: any, @Req() req: RequestWithUser) {
    try {
      const result = await this.keyRecoveryService.initiateKeyRecovery(
        initiateDto.keyId,
        req.user.userId,
        initiateDto.threshold || 3,
        initiateDto.totalShards || 5
      );
      
      return {
        success: true,
        message: 'Key recovery initiated successfully',
        recovery: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to initiate key recovery: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('assign-custodians')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async assignCustodians(@Body() assignDto: any) {
    try {
      const result = await this.keyRecoveryService.assignShardCustodians(
        assignDto.recoveryId,
        assignDto.assignments
      );
      
      return {
        success: true,
        message: 'Custodians assigned successfully',
        recovery: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to assign custodians: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('approve/:shardId')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async approveShard(@Param('shardId') shardId: string, @Req() req: RequestWithUser) {
    try {
      const result = await this.keyRecoveryService.submitShardApproval(
        shardId,
        req.user.userId
      );
      
      return {
        success: true,
        message: 'Shard approved successfully',
        approval: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to approve shard: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:recoveryId')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async getRecoveryStatus(@Param('recoveryId') recoveryId: string) {
    try {
      return await this.keyRecoveryService.getRecoveryStatus(recoveryId);
    } catch (error) {
      throw new HttpException(
        `Failed to get recovery status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('recover/:recoveryId')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async recoverKey(@Param('recoveryId') recoveryId: string, @Req() req: RequestWithUser) {
    try {
      const result = await this.keyRecoveryService.recoverKey(
        recoveryId,
        req.user.userId
      );
      
      return {
        success: true,
        message: 'Key recovered successfully',
        recovery: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to recover key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
