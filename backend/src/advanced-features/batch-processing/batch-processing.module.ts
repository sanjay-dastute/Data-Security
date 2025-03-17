import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchProcessingController } from './batch-processing.controller';
import { BatchProcessingService } from './batch-processing.service';
import { BatchProcess } from './entities/batch-process.entity';
import { EncryptionModule } from '../../encryption/encryption.module';
import { UserManagementModule } from '../../user-management/user-management.module';
import { DataHandlingModule } from '../../data-handling/data-handling.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BatchProcess]),
    EncryptionModule,
    UserManagementModule,
    DataHandlingModule,
  ],
  controllers: [BatchProcessingController],
  providers: [BatchProcessingService],
  exports: [BatchProcessingService],
})
export class BatchProcessingModule {}
