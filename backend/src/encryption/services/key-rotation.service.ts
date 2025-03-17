import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Key, KeyStatus } from '../entities/key.entity';
import { KeyService } from './key.service';

@Injectable()
export class KeyRotationService {
  private readonly logger = new Logger(KeyRotationService.name);

  constructor(
    @InjectRepository(Key)
    private keysRepository: Repository<Key>,
    private keyService: KeyService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTimerBasedKeyRotation() {
    this.logger.log('Running timer-based key rotation check');
    
    try {
      // Find keys that need rotation based on timer_interval
      const keysToRotate = await this.keysRepository.find({
        where: {
          status: KeyStatus.ACTIVE,
          timer_interval: LessThan(0), // Keys with timer_interval > 0
        },
      });
      
      // Filter keys that need rotation based on last rotation time
      const now = new Date();
      const keysNeedingRotation = keysToRotate.filter(key => {
        if (key.timer_interval <= 0) return false;
        
        const lastRotationTime = key.created_at;
        const timeSinceLastRotation = now.getTime() - lastRotationTime.getTime();
        const rotationIntervalMs = key.timer_interval * 1000;
        
        return timeSinceLastRotation >= rotationIntervalMs;
      });
      
      this.logger.log(`Found ${keysNeedingRotation.length} keys that need rotation`);
      
      // Rotate each key
      for (const key of keysNeedingRotation) {
        try {
          await this.keyService.rotateKey(key.key_id);
          this.logger.log(`Rotated key ${key.key_id}`);
        } catch (error) {
          this.logger.error(`Failed to rotate key ${key.key_id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in timer-based key rotation: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredKeys() {
    this.logger.log('Checking for expired keys');
    
    try {
      // Find keys that have expired
      const now = new Date();
      const expiredKeys = await this.keysRepository.find({
        where: {
          status: KeyStatus.ACTIVE,
          expires_at: LessThan(now),
        },
      });
      
      this.logger.log(`Found ${expiredKeys.length} expired keys`);
      
      // Mark each key as expired
      for (const key of expiredKeys) {
        try {
          key.status = KeyStatus.EXPIRED;
          await this.keysRepository.save(key);
          this.logger.log(`Marked key ${key.key_id} as expired`);
        } catch (error) {
          this.logger.error(`Failed to mark key ${key.key_id} as expired: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in expired key handling: ${error.message}`);
    }
  }
}
