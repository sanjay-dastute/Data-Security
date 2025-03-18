import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchProcess, BatchProcessStatus, BatchProcessType } from './entities/batch-process.entity';
import { KeyService } from '../../encryption/services/key.service';

@Injectable()
export class BatchProcessingService {
  private readonly logger = new Logger(BatchProcessingService.name);

  constructor(
    @InjectRepository(BatchProcess)
    private readonly batchProcessRepository: Repository<BatchProcess>,
    private readonly keyService: KeyService,
  ) {}

  async startBatchProcess(startDto: any, userId: string): Promise<any> {
    this.logger.log(`Starting batch process for user ${userId}`);
    
    // Create a new batch process record
    const batchProcess = this.batchProcessRepository.create({
      user_id: userId,
      total_items: startDto.totalItems,
      process_type: startDto.processType || BatchProcessType.ENCRYPTION,
      status: BatchProcessStatus.PROCESSING,
      started_at: new Date(),
    });
    
    // Save the batch process
    await this.batchProcessRepository.save(batchProcess);
    
    return batchProcess;
  }

  // Alias for compatibility with existing code
  async createBatchProcess(userId: string, totalItems: number, processType: string): Promise<any> {
    return this.startBatchProcess({ totalItems, processType }, userId);
  }

  async getBatchProcess(id: string): Promise<BatchProcess> {
    return this.batchProcessRepository.findOne({ where: { id } });
  }

  async getUserBatchProcesses(userId: string): Promise<BatchProcess[]> {
    return this.batchProcessRepository.find({
      where: { user_id: userId },
      order: { started_at: 'DESC' } as any,
    });
  }

  async updateBatchProcess(id: string, updateDto: any): Promise<BatchProcess> {
    await this.batchProcessRepository.update(id, updateDto);
    return this.getBatchProcess(id);
  }

  async completeBatchProcess(id: string, successCount: number, failureCount: number): Promise<BatchProcess> {
    this.logger.log(`Completing batch process ${id} with ${successCount} successes and ${failureCount} failures`);
    
    return this.updateBatchProcess(id, {
      status: BatchProcessStatus.COMPLETED,
      completed_at: new Date(),
      success_count: successCount,
      failure_count: failureCount,
    });
  }

  async cancelBatchProcess(id: string): Promise<BatchProcess> {
    this.logger.log(`Cancelling batch process ${id}`);
    
    return this.updateBatchProcess(id, {
      status: BatchProcessStatus.CANCELLED,
      completed_at: new Date(),
    });
  }
}
