import { IsArray, IsString, IsNotEmpty, IsUUID, IsOptional, IsEnum, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StorageConfigDto {
  @IsString()
  @IsEnum(['AWS_S3', 'AZURE_BLOB', 'GOOGLE_CLOUD', 'SQL_DATABASE', 'NOSQL_DATABASE', 'ON_PREMISES', 'CUSTOM'])
  type: string;

  @IsString()
  @IsOptional()
  bucketName?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  connectionString?: string;

  @IsString()
  @IsOptional()
  tableName?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsOptional()
  accessKey?: string;

  @IsString()
  @IsOptional()
  secretKey?: string;
}

export class StartBatchProcessingDto {
  @IsArray()
  @IsUUID('4', { each: true })
  fileIds: string[];

  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @IsUUID('4')
  keyId: string;

  @ValidateNested()
  @Type(() => StorageConfigDto)
  storageConfig: StorageConfigDto;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  parallelProcesses?: number;
}

export class BatchProcessingStatusDto {
  @IsUUID('4')
  batchId: string;

  @IsString()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
  status: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsNumber()
  estimatedTimeRemaining: number;

  @IsNumber()
  processedFiles: number;

  @IsNumber()
  totalFiles: number;

  @IsArray()
  @IsUUID('4', { each: true })
  fileIds: string[];

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  startedAt: string;

  @IsString()
  @IsOptional()
  completedAt?: string;
}

export class BatchProcessingResultDto {
  @IsUUID('4')
  batchId: string;

  @IsString()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
  status: string;

  @IsArray()
  results: {
    fileId: string;
    fileName: string;
    status: string;
    encryptedFileUrl?: string;
    errorMessage?: string;
  }[];
}
