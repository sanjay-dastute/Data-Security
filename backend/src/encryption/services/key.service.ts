import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from '../entities/key.entity';
import * as crypto from 'crypto';
import { KeyAlgorithm } from '../entities/key.entity';

@Injectable()
export class KeyService {
  private readonly logger = new Logger(KeyService.name);

  constructor(
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
  ) {}

  async createKey(userId: string, organizationId: string, algorithm: KeyAlgorithm, isHsmBacked: boolean = false): Promise<Key> {
    this.logger.log(`Creating new key for user ${userId} with algorithm ${algorithm}`);
    
    // Generate key material
    const keyMaterial = await this.generateKeyMaterial(algorithm);
    
    // Create key entity
    const key = this.keyRepository.create({
      name: `${algorithm} Key`,
      user_id: userId,
      organization_id: organizationId,
      algorithm,
      key_material: keyMaterial,
      is_hsm_backed: isHsmBacked,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    // Save key
    return this.keyRepository.save(key);
  }

  async getKeyById(keyId: string): Promise<Key> {
    this.logger.log(`Getting key with ID ${keyId}`);
    return this.keyRepository.findOne({ where: { id: keyId } });
  }

  async getUserKeys(userId: string): Promise<Key[]> {
    this.logger.log(`Getting keys for user ${userId}`);
    return this.keyRepository.find({ where: { user_id: userId } });
  }

  async getOrganizationKeys(organizationId: string): Promise<Key[]> {
    this.logger.log(`Getting keys for organization ${organizationId}`);
    return this.keyRepository.find({ where: { organization_id: organizationId } });
  }

  async deleteKey(keyId: string): Promise<boolean> {
    this.logger.log(`Deleting key with ID ${keyId}`);
    const result = await this.keyRepository.delete(keyId);
    return result.affected > 0;
  }

  async rotateKey(keyId: string): Promise<Key> {
    this.logger.log(`Rotating key with ID ${keyId}`);
    
    // Get existing key
    const existingKey = await this.keyRepository.findOne({ where: { id: keyId } });
    if (!existingKey) {
      throw new Error(`Key ${keyId} not found`);
    }
    
    // Generate new key material
    const newKeyMaterial = await this.generateKeyMaterial(existingKey.algorithm);
    
    // Update key
    existingKey.key_material = newKeyMaterial;
    existingKey.created_at = new Date();
    existingKey.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Save updated key
    return this.keyRepository.save(existingKey);
  }

  private async generateKeyMaterial(algorithm: KeyAlgorithm): Promise<string> {
    // Generate appropriate key based on algorithm
    switch (algorithm) {
      case KeyAlgorithm.AES_256_GCM:
        return crypto.randomBytes(32).toString('base64');
      case KeyAlgorithm.RSA_4096:
        // In a real implementation, this would generate an RSA key pair
        return crypto.randomBytes(512).toString('base64');
      case KeyAlgorithm.ECDSA_P384:
        // In a real implementation, this would generate an ECDSA key pair
        return crypto.randomBytes(48).toString('base64');
      default:
        return crypto.randomBytes(32).toString('base64');
    }
  }
}
