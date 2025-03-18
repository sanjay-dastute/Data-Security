import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from '../entities/key.entity';
import { BlockchainService } from './blockchain.service';
import * as crypto from 'crypto';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key)
    private keysRepository: Repository<Key>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async create(userId: string, organizationId: string, algorithm: string = 'AES-256-GCM'): Promise<Key> {
    // Generate a new encryption key
    const keyBuffer = crypto.randomBytes(32); // 256 bits
    const key = keyBuffer.toString('hex');
    
    // In a real implementation, this would be encrypted with a master key or HSM
    const encryptedKey = this.encryptKeyForStorage(key);
    
    // Calculate rotation date (30 days from now by default)
    const rotationDate = new Date();
    rotationDate.setDate(rotationDate.getDate() + 30);
    
    // Create key record
    const keyEntity = this.keysRepository.create({
      userId,
      organizationId,
      algorithm,
      encryptedKey,
      isActive: true,
      rotationDate,
      metadata: JSON.stringify({
        created: new Date(),
        purpose: 'data-encryption',
        strength: '256-bit',
      }),
    });
    
    const savedKey = await this.keysRepository.save(keyEntity);
    
    // Log key creation to blockchain
    await this.blockchainService.logEvent({
      user_id: userId,
      event_type: 'key_creation',
      timestamp: new Date(),
      metadata: {
        key_id: savedKey.id,
        algorithm,
      },
    });
    
    return savedKey;
  }

  async findAll(userId: string): Promise<Key[]> {
    return this.keysRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Key[]> {
    return this.keysRepository.find({
      where: { organizationId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Key> {
    const key = await this.keysRepository.findOne({
      where: { id },
    });
    
    if (!key) {
      throw new NotFoundException(`Key with ID ${id} not found`);
    }
    
    // If userId is provided, check if the user has access to this key
    if (userId && key.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to access this key');
    }
    
    return key;
  }

  async findActiveKey(userId: string): Promise<Key> {
    const key = await this.keysRepository.findOne({
      where: { 
        userId,
        isActive: true,
      },
      order: { created_at: 'DESC' },
    });
    
    if (!key) {
      throw new NotFoundException(`No active key found for user ${userId}`);
    }
    
    return key;
  }

  async revoke(id: string, userId: string): Promise<Key> {
    const key = await this.findOne(id, userId);
    
    key.isActive = false;
    const updatedKey = await this.keysRepository.save(key);
    
    // Log key revocation to blockchain
    await this.blockchainService.logEvent({
      user_id: userId,
      event_type: 'key_revocation',
      timestamp: new Date(),
      metadata: {
        key_id: id,
      },
    });
    
    return updatedKey;
  }

  async createRotatedKey(oldKeyId: string): Promise<Key> {
    const oldKey = await this.findOne(oldKeyId);
    
    // Create a new key with the same properties
    const newKey = await this.create(
      oldKey.userId,
      oldKey.organizationId,
      oldKey.algorithm,
    );
    
    // Update the new key to reference the old key
    newKey.previousKeyId = oldKeyId;
    await this.keysRepository.save(newKey);
    
    // Deactivate the old key
    oldKey.isActive = false;
    await this.keysRepository.save(oldKey);
    
    return newKey;
  }

  // In a real implementation, this would use a secure key management system
  private encryptKeyForStorage(key: string): string {
    // This is a simplified example - in production, use a proper key encryption key
    const masterKey = process.env.MASTER_KEY || 'quantum_trust_master_key_for_encryption';
    const cipher = crypto.createCipher('aes-256-cbc', masterKey);
    let encryptedKey = cipher.update(key, 'utf8', 'hex');
    encryptedKey += cipher.final('hex');
    return encryptedKey;
  }

  // In a real implementation, this would use a secure key management system
  decryptKeyFromStorage(encryptedKey: string): string {
    // This is a simplified example - in production, use a proper key encryption key
    const masterKey = process.env.MASTER_KEY || 'quantum_trust_master_key_for_encryption';
    const decipher = crypto.createDecipher('aes-256-cbc', masterKey);
    let key = decipher.update(encryptedKey, 'hex', 'utf8');
    key += decipher.final('utf8');
    return key;
  }

  async toResponseDto(key: Key) {
    // Parse metadata from JSON string
    const metadata = key.metadata ? JSON.parse(key.metadata as string) : {};
    
    return {
      id: key.id,
      userId: key.userId,
      organizationId: key.organizationId,
      algorithm: key.algorithm,
      isActive: key.isActive,
      rotationDate: key.rotationDate,
      expirationDate: key.expirationDate,
      previousKeyId: key.previousKeyId,
      created_at: key.created_at,
      updated_at: key.updated_at,
      metadata: metadata,
    };
  }
}
