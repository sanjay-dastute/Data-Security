import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key, KeyStatus } from '../entities/key.entity';
import { CreateKeyDto, UpdateKeyDto, KeyResponseDto, KeyType } from '../dto/key.dto';
import { HsmService } from './hsm.service';
import { BlockchainService } from './blockchain.service';
import * as crypto from 'crypto';

@Injectable()
export class KeyService {
  private readonly logger = new Logger(KeyService.name);
  
  constructor(
    @InjectRepository(Key)
    private keysRepository: Repository<Key>,
    private hsmService: HsmService,
    private blockchainService: BlockchainService,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    userId?: string,
    organizationId?: string,
    keyType?: KeyType,
  ): Promise<{ keys: KeyResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.keysRepository.createQueryBuilder('key');
    
    if (userId) {
      queryBuilder.andWhere('key.user_id = :userId', { userId });
    }
    
    if (organizationId) {
      queryBuilder.andWhere('key.organization_id = :organizationId', { organizationId });
    }
    
    if (keyType) {
      queryBuilder.andWhere('key.key_type = :keyType', { keyType });
    }
    
    const [keys, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return {
      keys: keys.map(this.mapToKeyResponse),
      total,
      page,
      limit,
    };
  }

  async findOne(keyId: string): Promise<Key> {
    const key = await this.keysRepository.findOne({ where: { key_id: keyId } });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }
    
    return key;
  }

  async findOneResponse(keyId: string): Promise<KeyResponseDto> {
    const key = await this.findOne(keyId);
    return this.mapToKeyResponse(key);
  }

  async updateLastUsed(keyId: string): Promise<void> {
    await this.keysRepository.update(
      { key_id: keyId },
      { last_used: new Date() }
    );
  }

  async create(createKeyDto: CreateKeyDto): Promise<KeyResponseDto> {
    // Check if HSM is available and configured
    const useHsm = await this.hsmService.isConfigured();
    
    // Generate key material
    let keyData: string;
    if (useHsm) {
      // Generate key in HSM
      keyData = await this.hsmService.generateKey(createKeyDto.key_type);
    } else {
      // Generate key using software (libsodium)
      keyData = this.generateSoftwareKey(createKeyDto.key_type);
    }
    
    // Create key entity
    const newKey = this.keysRepository.create({
      user_id: createKeyDto.user_id,
      organization_id: createKeyDto.organization_id,
      key_type: createKeyDto.key_type as any, // Type conversion between DTO and entity enums
      key_data: keyData,
      timer_interval: createKeyDto.timer_interval || 0,
      expires_at: createKeyDto.expires_at,
      version: 1,
      status: KeyStatus.ACTIVE,
    });
    
    // Save key to database
    const savedKey = await this.keysRepository.save(newKey);
    
    // Log key creation to blockchain
    await this.blockchainService.logKeyEvent({
      key_id: savedKey.key_id || savedKey.id,
      user_id: savedKey.user_id,
      organization_id: savedKey.organization_id,
      event_type: 'created',
      timestamp: new Date(),
      metadata: {
        key_type: savedKey.key_type,
        version: savedKey.version,
      },
    });
    
    return this.mapToKeyResponse(savedKey as Key);
  }

  async update(keyId: string, updateKeyDto: UpdateKeyDto): Promise<KeyResponseDto> {
    const key = await this.keysRepository.findOne({ where: { key_id: keyId } });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }
    
    // Update key properties
    if (updateKeyDto.key_type) {
      key.key_type = updateKeyDto.key_type as any; // Type conversion between DTO and entity enums
    }
    
    if (updateKeyDto.timer_interval !== undefined) {
      key.timer_interval = updateKeyDto.timer_interval;
    }
    
    if (updateKeyDto.expires_at) {
      key.expires_at = updateKeyDto.expires_at;
    }
    
    // Save updated key
    const updatedKey = await this.keysRepository.save(key);
    
    // Log key update to blockchain
    await this.blockchainService.logKeyEvent({
      key_id: updatedKey.key_id,
      user_id: updatedKey.user_id,
      organization_id: updatedKey.organization_id,
      event_type: 'updated',
      timestamp: new Date(),
      metadata: {
        key_type: updatedKey.key_type,
        version: updatedKey.version,
      },
    });
    
    return this.mapToKeyResponse(updatedKey);
  }

  async rotateKey(keyId: string): Promise<KeyResponseDto> {
    const key = await this.keysRepository.findOne({ where: { key_id: keyId } });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }
    
    // Check if HSM is available and configured
    const useHsm = await this.hsmService.isConfigured();
    
    // Generate new key material
    let newKeyData: string;
    if (useHsm) {
      // Generate key in HSM
      newKeyData = await this.hsmService.generateKey(key.key_type);
    } else {
      // Generate key using software (libsodium)
      newKeyData = this.generateSoftwareKey(key.key_type);
    }
    
    // Update key properties
    key.key_data = newKeyData;
    key.version += 1;
    key.created_at = new Date();
    
    // If expires_at is set, update it based on the current time
    if (key.expires_at) {
      const expirationPeriod = key.expires_at.getTime() - key.created_at.getTime();
      key.expires_at = new Date(Date.now() + expirationPeriod);
    }
    
    // Save updated key
    const rotatedKey = await this.keysRepository.save(key);
    
    // Log key rotation to blockchain
    await this.blockchainService.logKeyEvent({
      key_id: rotatedKey.key_id,
      user_id: rotatedKey.user_id,
      organization_id: rotatedKey.organization_id,
      event_type: 'rotated',
      timestamp: new Date(),
      metadata: {
        key_type: rotatedKey.key_type,
        version: rotatedKey.version,
      },
    });
    
    return this.mapToKeyResponse(rotatedKey);
  }

  async deactivateKey(keyId: string): Promise<KeyResponseDto> {
    const key = await this.keysRepository.findOne({ where: { key_id: keyId } });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }
    
    // Update key status
    key.status = KeyStatus.INACTIVE;
    
    // Save updated key
    const deactivatedKey = await this.keysRepository.save(key);
    
    // Log key deactivation to blockchain
    await this.blockchainService.logKeyEvent({
      key_id: deactivatedKey.key_id,
      user_id: deactivatedKey.user_id,
      organization_id: deactivatedKey.organization_id,
      event_type: 'deactivated',
      timestamp: new Date(),
      metadata: {
        key_type: deactivatedKey.key_type,
        version: deactivatedKey.version,
      },
    });
    
    return this.mapToKeyResponse(deactivatedKey);
  }

  async createKeyShards(keyId: string, numShards: number, threshold: number): Promise<void> {
    const key = await this.keysRepository.findOne({ where: { key_id: keyId } });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }
    
    // Generate shards using Shamir's Secret Sharing
    const shards = this.generateShards(key.key_data, numShards, threshold);
    
    // Store shards in key entity
    key.shards = shards;
    Object.assign(key, { shard_threshold: threshold });
    
    // Save updated key
    await this.keysRepository.save(key);
    
    // Log shard creation to blockchain
    await this.blockchainService.logKeyEvent({
      key_id: key.key_id,
      user_id: key.user_id,
      organization_id: key.organization_id,
      event_type: 'shards_created',
      timestamp: new Date(),
      metadata: {
        num_shards: numShards,
        threshold: threshold,
      },
    });
  }

  async recoverKeyFromShards(keyId: string, providedShards: Record<string, string>): Promise<KeyResponseDto> {
    const key = await this.keysRepository.findOne({ where: { key_id: keyId } });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }
    
    if (!key.shards || Object.keys(key.shards).length === 0) {
      throw new BadRequestException('This key does not have any shards for recovery');
    }
    
    // Check if enough shards are provided
    if (Object.keys(providedShards).length < key.shard_threshold) {
      throw new BadRequestException(`Not enough shards provided. Need at least ${key.shard_threshold}`);
    }
    
    // Validate provided shards
    for (const shardId of Object.keys(providedShards)) {
      if (!key.shards[shardId]) {
        throw new BadRequestException(`Invalid shard ID: ${shardId}`);
      }
    }
    
    try {
      // Reconstruct key from shards using Shamir's Secret Sharing
      const { reconstructSecret } = require('../utils/shamir');
      const recoveredKeyData = reconstructSecret(providedShards, key.shard_threshold);
      
      // Update the key with the recovered data
      key.key_data = recoveredKeyData;
      await this.keysRepository.save(key);
      
      // Log key recovery to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: key.key_id,
        user_id: key.user_id,
        organization_id: key.organization_id,
        event_type: 'recovered',
        timestamp: new Date(),
        metadata: {
          shards_used: Object.keys(providedShards).length,
        },
      });
      
      return this.mapToKeyResponse(key);
    } catch (error) {
      this.logger.error(`Failed to recover key from shards: ${error.message}`);
      throw new BadRequestException(`Failed to recover key: ${error.message}`);
    }
  }

  private generateSoftwareKey(keyType: KeyType): string {
    // In a real implementation, we would use libsodium for quantum-resistant encryption
    // For now, we just generate a random key
    return crypto.randomBytes(32).toString('hex');
  }

  private generateShards(secret: string, numShards: number, threshold: number): Record<string, string> {
    // Use Shamir's Secret Sharing to split the key into shards
    const { splitSecret } = require('../utils/shamir');
    return splitSecret(secret, numShards, threshold);
  }

  private mapToKeyResponse(key: Key): KeyResponseDto {
    return {
      key_id: key.key_id,
      user_id: key.user_id,
      organization_id: key.organization_id,
      key_type: key.key_type,
      created_at: key.created_at,
      expires_at: key.expires_at,
      version: key.version,
      last_used: key.last_used,
      timer_interval: key.timer_interval,
      has_shards: key.shards ? Object.keys(key.shards).length > 0 : false,
    };
  }
}
