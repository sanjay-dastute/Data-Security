import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HsmController } from './hsm.controller';
import { HsmService } from './hsm.service';
import { EncryptionModule } from '../../encryption/encryption.module';

@Module({
  imports: [
    ConfigModule,
    EncryptionModule
  ],
  controllers: [HsmController],
  providers: [HsmService],
  exports: [HsmService]
})
export class HsmModule {}
