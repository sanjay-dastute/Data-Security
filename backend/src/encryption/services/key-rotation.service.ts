import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KeyService } from './key.service';
import { BlockchainService } from './blockchain.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from '../entities/key.entity';

@Injectable()
export class KeyRotationService {
  private readonly logger = new Logger(KeyRotationService.name);

  constructor(
    private readonly keyService: KeyService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleKeyRotation() {
    this.logger.log('Running scheduled key rotation');
    
    try {
      // Get all keys that need rotation
      const keysToRotate = await this.getKeysNeedingRotation();
      
      this.logger.log(`Found ${keysToRotate.length} keys that need rotation`);
      
      // Rotate each key
      for (const key of keysToRotate) {
        try {
          await this.keyService.rotateKey(key.id);
          
          // Log rotation event to blockchain
          await this.blockchainService.logEvent({
            user_id: 'system',
            event_type: 'key_rotation',
            timestamp: new Date(),
            metadata: {
              key_id: key.id,
              rotation_type: 'scheduled',
            },
          });
        } catch (error) {
          this.logger.error(`Failed to rotate key ${key.id}: ${error.message}`);
        }
      }
      
      this.logger.log('Scheduled key rotation completed');
    } catch (error) {
      this.logger.error(`Key rotation failed: ${error.message}`);
    }
  }

  private async getKeysNeedingRotation(): Promise<Key[]> {
    // Get all active keys that have expired or are about to expire
    const now = new Date();
    const expirationThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    return this.keyRepository.find({
      where: {
        is_active: true,
        is_revoked: false,
        expires_at: { 
          $lte: expirationThreshold 
        } as any,
      },
    });
  }

  private async getExpiredTimerKeys(): Promise<Key[]> {
    // Get all timer-based keys that have expired
    const now = new Date();
    
    return this.keyRepository.find({
      where: {
        is_active: true,
        is_revoked: false,
        expires_at: { 
          $lte: now 
        } as any,
        type: 'timer',
      },
    });
  }
}
