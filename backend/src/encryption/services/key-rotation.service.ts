import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from '../entities/key.entity';
import { KeyService } from './key.service';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class KeyRotationService {
  private readonly logger = new Logger(KeyRotationService.name);

  constructor(
    @InjectRepository(Key)
    private keysRepository: Repository<Key>,
    private readonly keyService: KeyService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Cron('0 0 * * *') // Run at midnight every day
  async handleDailyKeyRotation() {
    this.logger.log('Running daily key rotation check');
    
    try {
      const keysToRotate = await this.findKeysForRotation();
      
      this.logger.log(`Found ${keysToRotate.length} keys that need rotation`);
      
      for (const key of keysToRotate) {
        this.logger.log(`Rotating key: ${key.id}`);
        
        try {
          // Create a new key to replace the old one
          await this.keyService.createRotatedKey(key.id);
          
          // Log key rotation to blockchain
          await this.blockchainService.logEvent({
            user_id: key.userId,
            event_type: 'key_rotation',
            timestamp: new Date(),
            metadata: {
              key_id: key.id,
              rotation_reason: 'scheduled',
            },
          });
        } catch (error) {
          this.logger.error(`Failed to rotate key ${key.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Key rotation job failed: ${error.message}`);
    }
  }

  private async findKeysForRotation(): Promise<Key[]> {
    const now = new Date();
    
    // Find active keys that have passed their rotation date
    return this.keysRepository.find({
      where: {
        isActive: true,
        rotationDate: {
          lessThan: now,
        },
      },
    });
  }

  async rotateExpiredKeys(): Promise<number> {
    const keysToRotate = await this.findKeysForRotation();
    
    for (const key of keysToRotate) {
      await this.keyService.createRotatedKey(key.id);
    }
    
    return keysToRotate.length;
  }
}
