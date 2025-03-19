import { Injectable, Logger, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchProcess, BatchProcessStatus } from './entities/batch-process.entity';
import { StartBatchProcessingDto, BatchProcessingStatusDto } from './dto/batch-processing.dto';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { KeyService } from '../../encryption/services/key.service';
import { UserService } from '../../user-management/services/user.service';
import { TemporaryMetadataService } from '../../data-handling/services/temporary-metadata.service';
import { StorageService } from '../../data-handling/services/storage.service';
import { UserRole } from '../../user-management/entities/user.entity';
import { StorageType } from '../../data-handling/dto/temporary-metadata.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BatchProcessingService {
  private readonly logger = new Logger(BatchProcessingService.name);

  constructor(
    @InjectRepository(BatchProcess)
    private readonly batchProcessRepository: Repository<BatchProcess>,
    private readonly encryptionService: EncryptionService,
    private readonly keyService: KeyService,
    private readonly userService: UserService,
    private readonly temporaryMetadataService: TemporaryMetadataService,
    private readonly storageService: StorageService,
  ) {}

  async startBatchProcessing(startDto: StartBatchProcessingDto, userId: string): Promise<any> {
    try {
      // Validate key
      const key = await this.keyService.findOne(startDto.keyId);
      if (!key) {
        throw new NotFoundException(`Key with ID ${startDto.keyId} not found`);
      }

      // Validate files
      const files = [];
      for (const fileId of startDto.fileIds) {
        const file = await this.temporaryMetadataService.findOne(fileId);
        if (!file) {
          throw new NotFoundException(`File with ID ${fileId} not found`);
        }
        
        // Check if user has access to the file
        if (file.user_id !== userId) {
          throw new UnauthorizedException(`You do not have access to file with ID ${fileId}`);
        }
        
        files.push(file);
      }

      // Create batch process
      const batchProcess = this.batchProcessRepository.create({
        id: uuidv4(),
        user_id: userId,
        organization_id: (await this.userService.findOne(userId)).organization_id,
        file_ids: startDto.fileIds,
        fields: startDto.fields,
        key_id: startDto.keyId,
        storage_config: startDto.storageConfig,
        parallel_processes: startDto.parallelProcesses || 4,
        status: BatchProcessStatus.PENDING,
        progress: 0,
        processed_files: 0,
        total_files: startDto.fileIds.length,
        estimated_time_remaining: startDto.fileIds.length * 2, // Estimate 2 seconds per file
        results: [],
      });

      await this.batchProcessRepository.save(batchProcess);

      // Start batch processing in background
      this.processBatch(batchProcess.id).catch(error => {
        this.logger.error(`Error processing batch ${batchProcess.id}: ${error.message}`);
      });

      return {
        batchId: batchProcess.id,
        status: batchProcess.status,
        message: 'Batch processing started',
      };
    } catch (error) {
      this.logger.error(`Failed to start batch processing: ${error.message}`);
      throw error;
    }
  }

  async getBatchStatus(batchId: string, userId: string): Promise<BatchProcessingStatusDto> {
    try {
      const batchProcess = await this.batchProcessRepository.findOne({ where: { id: batchId } as any });
      if (!batchProcess) {
        throw new NotFoundException(`Batch process with ID ${batchId} not found`);
      }

      // Check if user has access to the batch process
      if (batchProcess.user_id !== userId) {
        const user = await this.userService.findOne(userId);
        if (user.organization_id !== batchProcess.organization_id && user.role !== UserRole.ADMIN) {
          throw new UnauthorizedException('You do not have access to this batch process');
        }
      }

      return {
        batchId: batchProcess.id,
        status: batchProcess.status,
        progress: batchProcess.progress,
        estimatedTimeRemaining: batchProcess.estimated_time_remaining,
        processedFiles: batchProcess.processed_files,
        totalFiles: batchProcess.total_files,
        fileIds: batchProcess.file_ids,
        errorMessage: batchProcess.error_message,
        startedAt: batchProcess.created_at.toISOString(),
        completedAt: batchProcess.completed_at ? batchProcess.completed_at.toISOString() : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get batch status: ${error.message}`);
      throw error;
    }
  }

  async cancelBatchProcessing(batchId: string, userId: string): Promise<any> {
    try {
      const batchProcess = await this.batchProcessRepository.findOne({ where: { id: batchId } as any });
      if (!batchProcess) {
        throw new NotFoundException(`Batch process with ID ${batchId} not found`);
      }

      // Check if user has access to the batch process
      if (batchProcess.user_id !== userId) {
        const user = await this.userService.findOne(userId);
        if (user.organization_id !== batchProcess.organization_id && user.role !== UserRole.ADMIN) {
          throw new UnauthorizedException('You do not have access to this batch process');
        }
      }

      // Check if batch process can be cancelled
      if (batchProcess.status === BatchProcessStatus.COMPLETED || 
          batchProcess.status === BatchProcessStatus.FAILED ||
          batchProcess.status === BatchProcessStatus.CANCELLED) {
        throw new BadRequestException(`Batch process with ID ${batchId} cannot be cancelled because it is already ${batchProcess.status}`);
      }

      // Update batch process status
      batchProcess.status = BatchProcessStatus.CANCELLED;
      batchProcess.completed_at = new Date();
      await this.batchProcessRepository.save(batchProcess);

      return {
        batchId: batchProcess.id,
        status: batchProcess.status,
        message: 'Batch processing cancelled',
      };
    } catch (error) {
      this.logger.error(`Failed to cancel batch processing: ${error.message}`);
      throw error;
    }
  }

  async listBatchProcesses(
    userId: string,
    page = 1,
    limit = 10,
    status?: BatchProcessStatus,
  ): Promise<any> {
    try {
      const user = await this.userService.findOne(userId);
      
      // Build query
      const query: any = {};
      
      // Filter by user or organization
      if (user.role === UserRole.ADMIN) {
        // Admin can see all batch processes
      } else if (user.role === UserRole.ORG_ADMIN) {
        // Org admin can see all batch processes in their organization
        query.organization_id = user.organization_id;
      } else {
        // Regular user can only see their own batch processes
        query.user_id = userId;
      }
      
      // Filter by status
      if (status) {
        query.status = status;
      }
      
      // Get total count
      const total = await this.batchProcessRepository.count({ where: query });
      
      // Get batch processes
      const batchProcesses = await this.batchProcessRepository.find({
        where: query,
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      
      return {
        data: batchProcesses.map(bp => ({
          id: bp.id,
          status: bp.status,
          progress: bp.progress,
          processedFiles: bp.processed_files,
          totalFiles: bp.total_files,
          createdAt: bp.created_at,
          completedAt: bp.completed_at,
        })),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to list batch processes: ${error.message}`);
      throw error;
    }
  }

  private async processBatch(batchId: string): Promise<void> {
    try {
      // Get batch process
      const batchProcess = await this.batchProcessRepository.findOne({ where: { id: batchId } as any });
      if (!batchProcess) {
        throw new NotFoundException(`Batch process with ID ${batchId} not found`);
      }

      // Update status to processing
      batchProcess.status = BatchProcessStatus.PROCESSING;
      await this.batchProcessRepository.save(batchProcess);

      // Get key
      const key = await this.keyService.findOne(batchProcess.key_id);
      if (!key) {
        throw new NotFoundException(`Key with ID ${batchProcess.key_id} not found`);
      }

      // Process files
      const results = [];
      let processedFiles = 0;

      for (const fileId of batchProcess.file_ids) {
        try {
          // Check if batch process was cancelled
          const updatedBatchProcess = await this.batchProcessRepository.findOne({ where: { id: batchId } as any });
          if (updatedBatchProcess.status === BatchProcessStatus.CANCELLED) {
            break;
          }

          // Get file
          const file = await this.temporaryMetadataService.findOne(fileId);
          if (!file) {
            results.push({
              fileId,
              fileName: 'Unknown',
              status: 'failed',
              errorMessage: `File with ID ${fileId} not found`,
            });
            continue;
          }

          // Get file content
          const fileContent = await this.storageService.getData(
            file.encrypted_file_path,
            batchProcess.storage_config || {}
          );
          
          // Encrypt file
          const encryptionResult = await this.encryptionService.encryptData(
            fileContent.data,
            batchProcess.key_id,
            batchProcess.fields
          );

          // Store encrypted file
          // Convert encryptedData to Buffer if it's not already
          const encryptedDataBuffer = typeof encryptionResult.encryptedData === 'string' 
            ? Buffer.from(encryptionResult.encryptedData) 
            : Buffer.from(JSON.stringify(encryptionResult.encryptedData));
            
          // Determine storage type from config or default to AWS S3
          const storageType = batchProcess.storage_config?.type 
            ? StorageType[batchProcess.storage_config.type.toUpperCase()] 
            : StorageType.AWS_S3;
            
          const storageResult = await this.storageService.storeData(
            encryptedDataBuffer,
            file.file_name,
            storageType,
            batchProcess.storage_config || {},
            batchProcess.user_id
          );

          // Add result
          results.push({
            fileId,
            fileName: file.file_name,
            status: 'completed',
            encryptedFileUrl: storageResult.storage_path,
          });

          // Delete temporary file
          await this.temporaryMetadataService.remove(fileId);

          // Update progress
          processedFiles++;
          const progress = Math.round((processedFiles / batchProcess.total_files) * 100);
          const estimatedTimeRemaining = (batchProcess.total_files - processedFiles) * 2; // Estimate 2 seconds per file

          batchProcess.progress = progress;
          batchProcess.processed_files = processedFiles;
          batchProcess.estimated_time_remaining = estimatedTimeRemaining;
          batchProcess.results = results;
          await this.batchProcessRepository.save(batchProcess);
        } catch (error) {
          this.logger.error(`Error processing file ${fileId}: ${error.message}`);
          
          // Add error result
          results.push({
            fileId,
            fileName: 'Unknown',
            status: 'failed',
            errorMessage: error.message,
          });
          
          // Update progress
          processedFiles++;
          const progress = Math.round((processedFiles / batchProcess.total_files) * 100);
          const estimatedTimeRemaining = (batchProcess.total_files - processedFiles) * 2;
          
          batchProcess.progress = progress;
          batchProcess.processed_files = processedFiles;
          batchProcess.estimated_time_remaining = estimatedTimeRemaining;
          batchProcess.results = results;
          await this.batchProcessRepository.save(batchProcess);
        }
      }

      // Update batch process status
      batchProcess.status = BatchProcessStatus.COMPLETED;
      batchProcess.progress = 100;
      batchProcess.estimated_time_remaining = 0;
      batchProcess.completed_at = new Date();
      batchProcess.results = results;
      await this.batchProcessRepository.save(batchProcess);
    } catch (error) {
      this.logger.error(`Error processing batch ${batchId}: ${error.message}`);
      
      // Update batch process status
      const batchProcess = await this.batchProcessRepository.findOne({ where: { id: batchId } as any });
      if (batchProcess) {
        batchProcess.status = BatchProcessStatus.FAILED;
        batchProcess.error_message = error.message;
        batchProcess.completed_at = new Date();
        await this.batchProcessRepository.save(batchProcess);
      }
    }
  }
}
