import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key, KeyStatus } from '../entities/key.entity';
import { User } from '../../user-management/entities/user.entity';
import { BlockchainService } from './blockchain.service';
import { KeyResponseDto } from '../dto/key.dto';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key)
    private keysRepository: Repository<Key>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private blockchainService: BlockchainService,
  ) {}

  async getUserKeys(userId: string): Promise<KeyResponseDto[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const keys = await this.keysRepository.find({
      where: [
        { userId },
        { organizationId: user.organizationId },
      ],
    });

    return keys.map(key => this.mapToResponseDto(key));
  }

  async createKey(
    userId: string,
    name: string,
    expirationTime?: Date,
    metadata?: any,
  ): Promise<KeyResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, we would generate a secure key
    // For this example, we'll use a placeholder
    const encryptedKey = 'encrypted-key-material-placeholder';
    const publicKey = 'public-key-material-placeholder';

    // Convert metadata to JSON string for SQLite compatibility
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    const key = this.keysRepository.create({
      name,
      encrypted_key: encryptedKey,
      public_key: publicKey,
      status: KeyStatus.ACTIVE,
      expiration_time: expirationTime,
      userId,
      organizationId: user.organizationId,
      metadata: metadataStr,
    });

    const savedKey = await this.keysRepository.save(key);

    // Log key creation to blockchain
    await this.blockchainService.logEvent({
      user_id: userId,
      event_type: 'key_created',
      timestamp: new Date(),
      metadata: {
        key_id: savedKey.id,
        key_name: savedKey.name,
      },
    });

    return this.mapToResponseDto(savedKey);
  }

  async getKey(id: string, userId: string): Promise<KeyResponseDto> {
    const key = await this.keysRepository.findOne({ where: { id } });
    if (!key) {
      throw new NotFoundException('Key not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has permission to access this key
    if (key.userId !== userId && key.organizationId !== user.organizationId) {
      throw new ForbiddenException('You do not have permission to access this key');
    }

    return this.mapToResponseDto(key);
  }

  async revokeKey(id: string, userId: string): Promise<KeyResponseDto> {
    const key = await this.keysRepository.findOne({ where: { id } });
    if (!key) {
      throw new NotFoundException('Key not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has permission to revoke this key
    if (key.userId !== userId && key.organizationId !== user.organizationId) {
      throw new ForbiddenException('You do not have permission to revoke this key');
    }

    key.status = KeyStatus.REVOKED;
    const updatedKey = await this.keysRepository.save(key);

    // Log key revocation to blockchain
    await this.blockchainService.logEvent({
      user_id: userId,
      event_type: 'key_revoked',
      timestamp: new Date(),
      metadata: {
        key_id: updatedKey.id,
        key_name: updatedKey.name,
      },
    });

    return this.mapToResponseDto(updatedKey);
  }

  private mapToResponseDto(key: Key): KeyResponseDto {
    // Parse metadata from JSON string
    const metadata = key.metadata ? JSON.parse(key.metadata as string) : null;
    
    return {
      id: key.id,
      name: key.name,
      status: key.status,
      expiration_time: key.expiration_time,
      created_at: key.created_at,
      updated_at: key.updated_at,
      userId: key.userId,
      organizationId: key.organizationId,
      metadata: metadata,
    };
  }
}
