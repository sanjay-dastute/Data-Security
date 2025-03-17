import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HsmModule } from './hsm/hsm.module';
import { KeyRecoveryModule } from './key-recovery/key-recovery.module';
import { BatchProcessingModule } from './batch-processing/batch-processing.module';
import { MultiCloudModule } from './multi-cloud/multi-cloud.module';
import { SelfDestructModule } from './self-destruct/self-destruct.module';

@Module({
  imports: [
    HsmModule,
    KeyRecoveryModule,
    BatchProcessingModule,
    MultiCloudModule,
    SelfDestructModule
  ],
  exports: [
    HsmModule,
    KeyRecoveryModule,
    BatchProcessingModule,
    MultiCloudModule,
    SelfDestructModule
  ]
})
export class AdvancedFeaturesModule {}
