import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemporaryMetadata } from '../entities/temporary-metadata.entity';
import { CreateTemporaryMetadataDto, UpdateTemporaryMetadataDto, TemporaryMetadataResponseDto } from '../dto/temporary-metadata.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TemporaryMetadataService {
  private readonly logger = new Logger(TemporaryMetadataService.name);

  constructor(
    @InjectRepository(TemporaryMetadata)
    private temporaryMetadataRepository: Repository<TemporaryMetadata>,
  ) {}

  /**
   * Create a new temporary metadata entry
   */
  async create(createDto: CreateTemporaryMetadataDto): Promise<TemporaryMetadataResponseDto> {
    try {
      // Create new temporary metadata
      const newMetadata = this.temporaryMetadataRepository.create({
        ...createDto,
        fields_encrypted: createDto.fields_encrypted || [],
        storage_config: createDto.storage_config || {},
      });
      
      // Save to database
      const savedMetadata = await this.temporaryMetadataRepository.save(newMetadata);
      
      return this.mapToResponseDto(savedMetadata);
    } catch (error) {
      this.logger.error(`Failed to create temporary metadata: ${error.message}`);
      throw new BadRequestException(`Failed to create temporary metadata: ${error.message}`);
    }
  }

  /**
   * Find all temporary metadata entries for a user
   */
  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: TemporaryMetadataResponseDto[]; total: number; page: number; limit: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const queryBuilder = this.temporaryMetadataRepository.createQueryBuilder('metadata');
      
      // Filter by user ID
      queryBuilder.where('metadata.user_id = :userId', { userId });
      
      // Order by creation date (newest first)
      queryBuilder.orderBy('metadata.created_at', 'DESC');
      
      // Paginate results
      const [results, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();
      
      return {
        data: results.map(metadata => this.mapToResponseDto(metadata)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to find temporary metadata: ${error.message}`);
      throw new BadRequestException(`Failed to find temporary metadata: ${error.message}`);
    }
  }

  /**
   * Find a temporary metadata entry by ID
   */
  async findOne(id: string): Promise<TemporaryMetadataResponseDto> {
    try {
      const metadata = await this.temporaryMetadataRepository.findOne({ where: { data_id: id } });
      
      if (!metadata) {
        throw new NotFoundException(`Temporary metadata with ID ${id} not found`);
      }
      
      return this.mapToResponseDto(metadata);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to find temporary metadata: ${error.message}`);
      throw new BadRequestException(`Failed to find temporary metadata: ${error.message}`);
    }
  }

  /**
   * Update a temporary metadata entry
   */
  async update(id: string, updateDto: UpdateTemporaryMetadataDto): Promise<TemporaryMetadataResponseDto> {
    try {
      const metadata = await this.temporaryMetadataRepository.findOne({ where: { data_id: id } });
      
      if (!metadata) {
        throw new NotFoundException(`Temporary metadata with ID ${id} not found`);
      }
      
      // Update metadata
      const updatedMetadata = {
        ...metadata,
        ...updateDto,
      };
      
      // Save to database
      const savedMetadata = await this.temporaryMetadataRepository.save(updatedMetadata);
      
      return this.mapToResponseDto(savedMetadata);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to update temporary metadata: ${error.message}`);
      throw new BadRequestException(`Failed to update temporary metadata: ${error.message}`);
    }
  }

  /**
   * Delete a temporary metadata entry
   */
  async remove(id: string): Promise<void> {
    try {
      const metadata = await this.temporaryMetadataRepository.findOne({ where: { data_id: id } });
      
      if (!metadata) {
        throw new NotFoundException(`Temporary metadata with ID ${id} not found`);
      }
      
      // Delete from database
      await this.temporaryMetadataRepository.remove(metadata);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to delete temporary metadata: ${error.message}`);
      throw new BadRequestException(`Failed to delete temporary metadata: ${error.message}`);
    }
  }

  /**
   * Clean up old temporary metadata entries
   * Runs every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldMetadata(): Promise<void> {
    try {
      this.logger.log('Cleaning up old temporary metadata');
      
      // Get date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Delete old metadata
      const result = await this.temporaryMetadataRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :date', { date: thirtyDaysAgo })
        .execute();
      
      this.logger.log(`Deleted ${result.affected} old temporary metadata entries`);
    } catch (error) {
      this.logger.error(`Failed to clean up old metadata: ${error.message}`);
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: TemporaryMetadata): TemporaryMetadataResponseDto {
    return {
      id: entity.id,
      data_id: entity.data_id,
      file_name: entity.file_name,
      file_type: entity.file_type,
      user_id: entity.user_id,
      organization_id: entity.organization_id,
      session_id: entity.session_id,
      metadata: entity.metadata,
      is_processed: entity.is_processed,
      fields_encrypted: entity.fields_encrypted || [],
      encrypted_file_path: entity.encrypted_file_path,
      self_destruct_script: entity.self_destruct_script,
      storage_config: entity.storage_config || {},
      created_at: entity.created_at,
      updated_at: entity.updated_at
    };
  }
}
