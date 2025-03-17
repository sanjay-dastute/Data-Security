import { Controller, Post, Get, Body, Param, UseGuards, Req, BadRequestException, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { BatchProcessingService } from './batch-processing.service';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import { StartBatchProcessingDto, BatchProcessingStatusDto } from './dto/batch-processing.dto';
import { Request } from 'express';

@Controller('batch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatchProcessingController {
  constructor(
    private readonly batchProcessingService: BatchProcessingService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('start')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async startBatchProcessing(@Body() startDto: StartBatchProcessingDto, @Req() req: Request) {
    try {
      const result = await this.batchProcessingService.startBatchProcessing(startDto, req.user['userId']);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'batch-processing',
        user_id: req.user['userId'],
        event_type: 'started',
        timestamp: new Date(),
        metadata: {
          batch_id: result.batchId,
          file_count: startDto.fileIds.length,
          fields: startDto.fields,
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to start batch processing: ${error.message}`);
    }
  }

  @Get('status/:batchId')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async getBatchStatus(@Param('batchId') batchId: string, @Req() req: Request) {
    try {
      return await this.batchProcessingService.getBatchStatus(batchId, req.user['userId']);
    } catch (error) {
      throw new BadRequestException(`Failed to get batch status: ${error.message}`);
    }
  }

  @Post('cancel/:batchId')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async cancelBatchProcessing(@Param('batchId') batchId: string, @Req() req: Request) {
    try {
      const result = await this.batchProcessingService.cancelBatchProcessing(batchId, req.user['userId']);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'batch-processing',
        user_id: req.user['userId'],
        event_type: 'cancelled',
        timestamp: new Date(),
        metadata: {
          batch_id: batchId,
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to cancel batch processing: ${error.message}`);
    }
  }

  @Get('list')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async listBatchProcesses(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
  ) {
    try {
      return await this.batchProcessingService.listBatchProcesses(
        req.user['userId'],
        page,
        limit,
        status,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to list batch processes: ${error.message}`);
    }
  }
}
