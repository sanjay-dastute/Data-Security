import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemporaryMetadata } from '../entities/temporary-metadata.entity';

@Injectable()
export class TemporaryMetadataService {
  constructor(
    @InjectRepository(TemporaryMetadata)
    private temporaryMetadataRepository: Repository<TemporaryMetadata>,
  ) {}

  async create(data: Partial<TemporaryMetadata>): Promise<TemporaryMetadata> {
    // Convert JSON objects to strings for SQLite compatibility
    if (data.fieldsEncrypted && typeof data.fieldsEncrypted !== 'string') {
      data.fieldsEncrypted = JSON.stringify(data.fieldsEncrypted);
    }
    
    if (data.storageConfig && typeof data.storageConfig !== 'string') {
      data.storageConfig = JSON.stringify(data.storageConfig);
    }
    
    const metadata = this.temporaryMetadataRepository.create(data);
    return this.temporaryMetadataRepository.save(metadata);
  }

  async findAll(): Promise<TemporaryMetadata[]> {
    return this.temporaryMetadataRepository.find();
  }

  async findByUser(userId: string): Promise<TemporaryMetadata[]> {
    return this.temporaryMetadataRepository.find({
      where: { userId },
    });
  }

  async findOne(id: string): Promise<TemporaryMetadata> {
    const metadata = await this.temporaryMetadataRepository.findOne({
      where: { id },
    });
    
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    
    return metadata;
  }

  async findByDataId(id: string): Promise<TemporaryMetadata> {
    const metadata = await this.temporaryMetadataRepository.findOne({
      where: { dataId: id },
    });
    
    if (!metadata) {
      throw new NotFoundException(`Metadata with data ID ${id} not found`);
    }
    
    return metadata;
  }

  async update(id: string, data: Partial<TemporaryMetadata>): Promise<TemporaryMetadata> {
    const metadata = await this.findOne(id);
    
    // Convert JSON objects to strings for SQLite compatibility
    if (data.fieldsEncrypted && typeof data.fieldsEncrypted !== 'string') {
      data.fieldsEncrypted = JSON.stringify(data.fieldsEncrypted);
    }
    
    if (data.storageConfig && typeof data.storageConfig !== 'string') {
      data.storageConfig = JSON.stringify(data.storageConfig);
    }
    
    Object.assign(metadata, data);
    return this.temporaryMetadataRepository.save(metadata);
  }

  async remove(id: string): Promise<void> {
    const metadata = await this.findOne(id);
    await this.temporaryMetadataRepository.remove(metadata);
  }

  async markAsProcessed(id: string): Promise<TemporaryMetadata> {
    const metadata = await this.findOne(id);
    metadata.processed = true;
    return this.temporaryMetadataRepository.save(metadata);
  }

  async toResponseDto(entity: TemporaryMetadata) {
    // Parse JSON strings back to objects
    const fieldsEncrypted = entity.fieldsEncrypted 
      ? JSON.parse(entity.fieldsEncrypted as string) 
      : [];
      
    const storageConfig = entity.storageConfig 
      ? JSON.parse(entity.storageConfig as string) 
      : {};
      
    return {
      id: entity.id,
      dataId: entity.dataId,
      fileType: entity.fileType,
      userId: entity.userId,
      fieldsEncrypted: fieldsEncrypted,
      encryptedFilePath: entity.encryptedFilePath,
      selfDestructScript: entity.selfDestructScript,
      storageConfig: storageConfig,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      processed: entity.processed,
      expiresAt: entity.expiresAt,
    };
  }
}
