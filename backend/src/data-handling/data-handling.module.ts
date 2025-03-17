import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TemporaryMetadata } from './entities/temporary-metadata.entity';
import { TemporaryMetadataController } from './controllers/temporary-metadata.controller';
import { FileUploadController } from './controllers/file-upload.controller';
import { DataEncryptionController } from './controllers/data-encryption.controller';
import { BatchProcessingController } from './controllers/batch-processing.controller';
import { TemporaryMetadataService } from './services/temporary-metadata.service';
import { FileParserService } from './services/file-parser.service';
import { StorageService } from './services/storage.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([TemporaryMetadata]),
    ScheduleModule.forRoot(),
    EncryptionModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for larger files
      },
    }),
  ],
  controllers: [
    TemporaryMetadataController,
    FileUploadController,
    DataEncryptionController,
    BatchProcessingController,
  ],
  providers: [
    TemporaryMetadataService,
    FileParserService,
    StorageService,
  ],
  exports: [
    TemporaryMetadataService,
    FileParserService,
    StorageService,
  ],
})
export class DataHandlingModule {}
