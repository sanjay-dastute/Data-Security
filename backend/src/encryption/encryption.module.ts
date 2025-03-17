import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Key } from './entities/key.entity';
import { KeyService } from './services/key.service';
import { KeyController } from './controllers/key.controller';
import { EncryptionService } from './services/encryption.service';
import { EncryptionController } from './controllers/encryption.controller';
import { HsmService } from './services/hsm.service';
import { BlockchainService } from './services/blockchain.service';
import { KeyRotationService } from './services/key-rotation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Key]),
    ScheduleModule.forRoot(),
  ],
  controllers: [KeyController, EncryptionController],
  providers: [
    KeyService,
    EncryptionService,
    HsmService,
    BlockchainService,
    KeyRotationService,
  ],
  exports: [KeyService, EncryptionService, HsmService, BlockchainService],
})
export class EncryptionModule {}
