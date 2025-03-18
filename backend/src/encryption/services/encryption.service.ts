import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key, KeyStatus } from '../entities/key.entity';
import { User } from '../../user-management/entities/user.entity';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class EncryptionService {
  constructor(
    @InjectRepository(Key)
    private keysRepository: Repository<Key>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private blockchainService: BlockchainService,
  ) {}

  async encryptData(userId: string, keyId: string, data: any): Promise<any> {
    const key = await this.keysRepository.findOne({ where: { id: keyId } });
    if (!key) {
      throw new NotFoundException('Key not found');
    }

    // Check if key is active
    if (key.status !== KeyStatus.ACTIVE) {
      throw new ForbiddenException('Key is not active');
    }

    // Check if user has permission to use this key
    if (key.userId !== userId && key.organizationId !== key.organizationId) {
      throw new ForbiddenException('You do not have permission to use this key');
    }

    // In a real implementation, we would decrypt the key material and use it to encrypt the data
    // For this example, we'll just return a placeholder
    const encryptedData = {
      encrypted: true,
      data: `encrypted-${JSON.stringify(data)}`,
      key_id: keyId,
      timestamp: new Date(),
    };

    // Log encryption event to blockchain
    await this.blockchainService.logEvent({
      user_id: userId,
      event_type: 'data_encrypted',
      timestamp: new Date(),
      metadata: {
        key_id: keyId,
        data_size: JSON.stringify(data).length,
      },
    });

    return encryptedData;
  }

  async decryptData(userId: string, keyId: string, encryptedData: any): Promise<any> {
    const key = await this.keysRepository.findOne({ where: { id: keyId } });
    if (!key) {
      throw new NotFoundException('Key not found');
    }

    // Check if user has permission to use this key
    if (key.userId !== userId && key.organizationId !== key.organizationId) {
      throw new ForbiddenException('You do not have permission to use this key');
    }

    // In a real implementation, we would decrypt the key material and use it to decrypt the data
    // For this example, we'll just return a placeholder
    const decryptedData = {
      decrypted: true,
      data: encryptedData.data.replace('encrypted-', ''),
      key_id: keyId,
      timestamp: new Date(),
    };

    // Log decryption event to blockchain
    await this.blockchainService.logEvent({
      user_id: userId,
      event_type: 'data_decrypted',
      timestamp: new Date(),
      metadata: {
        key_id: keyId,
      },
    });

    return decryptedData;
  }
}
