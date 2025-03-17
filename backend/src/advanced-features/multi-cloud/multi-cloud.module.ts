import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MultiCloudController } from './multi-cloud.controller';
import { MultiCloudService } from './multi-cloud.service';
import { EncryptionModule } from '../../encryption/encryption.module';

@Module({
  imports: [
    ConfigModule,
    EncryptionModule
  ],
  controllers: [MultiCloudController],
  providers: [MultiCloudService],
  exports: [MultiCloudService]
})
export class MultiCloudModule {}
