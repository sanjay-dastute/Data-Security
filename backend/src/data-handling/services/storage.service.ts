import { Injectable, Logger } from '@nestjs/common';
import { StorageType, StorageResponseDto } from '../dto/storage-response.dto';
import * as AWS from 'aws-sdk';
import { BlobServiceClient } from '@azure/storage-blob';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: AWS.S3;
  private readonly azureBlobService: BlobServiceClient;
  private readonly gcpStorage: Storage;

  constructor() {
    // Initialize AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Initialize Azure Blob Storage
    this.azureBlobService = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    );

    // Initialize Google Cloud Storage
    this.gcpStorage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE,
    });
  }

  async storeData(
    data: any,
    storageConfig: any,
    userId: string,
    organizationId: string,
  ): Promise<StorageResponseDto> {
    this.logger.log(`Storing data for user ${userId} with provider ${storageConfig.provider}`);

    const provider = storageConfig.provider as StorageType;
    const fileName = `${Date.now()}-${userId.substring(0, 8)}.json`;
    const content = JSON.stringify(data);

    switch (provider) {
      case StorageType.AWS:
        return this.storeInS3(content, fileName, storageConfig);
      case StorageType.AZURE:
        return this.storeInAzure(content, fileName, storageConfig);
      case StorageType.GCP:
        return this.storeInGCP(content, fileName, storageConfig);
      case StorageType.LOCAL:
        return this.storeLocally(content, fileName, storageConfig);
      default:
        throw new Error(`Unsupported storage provider: ${provider}`);
    }
  }

  private async storeInS3(
    content: string,
    fileName: string,
    config: any,
  ): Promise<StorageResponseDto> {
    this.logger.log(`Storing in AWS S3: ${fileName}`);

    const params = {
      Bucket: config.bucket,
      Key: `${config.prefix || ''}${fileName}`,
      Body: content,
      ContentType: 'application/json',
    };

    try {
      const result = await this.s3.upload(params).promise();

      return {
        success: true,
        provider: StorageType.AWS,
        location: result.Location,
        key: result.Key,
        metadata: {
          bucket: config.bucket,
          region: config.region || process.env.AWS_REGION,
          contentType: 'application/json',
        },
      };
    } catch (error) {
      this.logger.error(`S3 storage error: ${error.message}`);
      throw new Error(`Failed to store in S3: ${error.message}`);
    }
  }

  private async storeInAzure(
    content: string,
    fileName: string,
    config: any,
  ): Promise<StorageResponseDto> {
    this.logger.log(`Storing in Azure Blob Storage: ${fileName}`);

    try {
      const containerClient = this.azureBlobService.getContainerClient(
        config.container,
      );
      const blockBlobClient = containerClient.getBlockBlobClient(
        `${config.prefix || ''}${fileName}`,
      );

      await blockBlobClient.upload(content, content.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
        },
      });

      return {
        success: true,
        provider: StorageType.AZURE,
        location: blockBlobClient.url,
        key: blockBlobClient.name,
        metadata: {
          container: config.container,
          contentType: 'application/json',
        },
      };
    } catch (error) {
      this.logger.error(`Azure storage error: ${error.message}`);
      throw new Error(`Failed to store in Azure: ${error.message}`);
    }
  }

  private async storeInGCP(
    content: string,
    fileName: string,
    config: any,
  ): Promise<StorageResponseDto> {
    this.logger.log(`Storing in Google Cloud Storage: ${fileName}`);

    try {
      const bucket = this.gcpStorage.bucket(config.bucket);
      const file = bucket.file(`${config.prefix || ''}${fileName}`);

      await file.save(content, {
        contentType: 'application/json',
      });

      return {
        success: true,
        provider: StorageType.GCP,
        location: `https://storage.googleapis.com/${config.bucket}/${file.name}`,
        key: file.name,
        metadata: {
          bucket: config.bucket,
          contentType: 'application/json',
        },
      };
    } catch (error) {
      this.logger.error(`GCP storage error: ${error.message}`);
      throw new Error(`Failed to store in GCP: ${error.message}`);
    }
  }

  private async storeLocally(
    content: string,
    fileName: string,
    config: any,
  ): Promise<StorageResponseDto> {
    this.logger.log(`Storing locally: ${fileName}`);

    try {
      const storagePath = config.path || path.join(process.cwd(), 'storage');
      
      // Ensure directory exists
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      
      const filePath = path.join(storagePath, fileName);
      fs.writeFileSync(filePath, content);

      return {
        success: true,
        provider: StorageType.LOCAL,
        location: filePath,
        key: fileName,
        metadata: {
          path: storagePath,
          contentType: 'application/json',
        },
      };
    } catch (error) {
      this.logger.error(`Local storage error: ${error.message}`);
      throw new Error(`Failed to store locally: ${error.message}`);
    }
  }
}
