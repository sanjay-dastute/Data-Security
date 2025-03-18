import { IsString, IsUUID, IsOptional, IsArray, IsObject, IsEnum, IsBoolean, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export enum DataFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PARQUET = 'parquet',
  AVRO = 'avro',
  BINARY = 'binary',
  TEXT = 'text',
  CUSTOM = 'custom',
}

export enum StorageType {
  AWS_S3 = 'aws_s3',
  AZURE_BLOB = 'azure_blob',
  GOOGLE_CLOUD = 'google_cloud',
  SQL_DATABASE = 'sql_database',
  NOSQL_DATABASE = 'nosql_database',
  ON_PREMISES = 'on_premises',
  CUSTOM = 'custom',
}

export class TemporaryMetadataDto {
  @IsString()
  user_id: string;

  @IsString()
  @IsOptional()
  organization_id?: string;

  @IsString()
  session_id: string;

  @IsString()
  metadata: string;

  @IsBoolean()
  @IsOptional()
  is_processed?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expires_at?: Date;

  @IsString()
  @IsOptional()
  original_name?: string;

  @IsString()
  @IsOptional()
  file_type?: string;

  @IsString()
  @IsOptional()
  file_path?: string;

  @IsString()
  @IsOptional()
  file_name?: string;

  @IsNumber()
  @IsOptional()
  file_size?: number;

  @IsNumber()
  @IsOptional()
  record_count?: number;

  @IsString()
  @IsOptional()
  fields?: string;

  @IsString()
  @IsOptional()
  sample_data?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  processed_at?: Date;

  @IsArray()
  @IsOptional()
  fields_encrypted?: string[];

  @IsString()
  @IsOptional()
  self_destruct_script?: string;

  @IsString()
  @IsOptional()
  encrypted_file_path?: string;

  @IsObject()
  @IsOptional()
  storage_config?: Record<string, any>;
}

export class CreateTemporaryMetadataDto extends TemporaryMetadataDto {}

export class UpdateTemporaryMetadataDto {
  @IsString()
  @IsOptional()
  metadata?: string;

  @IsBoolean()
  @IsOptional()
  is_processed?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expires_at?: Date;

  @IsString()
  @IsOptional()
  file_path?: string;

  @IsString()
  @IsOptional()
  file_name?: string;

  @IsNumber()
  @IsOptional()
  file_size?: number;

  @IsNumber()
  @IsOptional()
  record_count?: number;

  @IsString()
  @IsOptional()
  fields?: string;

  @IsString()
  @IsOptional()
  sample_data?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  processed_at?: Date;

  @IsArray()
  @IsOptional()
  fields_encrypted?: string[];

  @IsString()
  @IsOptional()
  self_destruct_script?: string;

  @IsString()
  @IsOptional()
  encrypted_file_path?: string;

  @IsObject()
  @IsOptional()
  storage_config?: Record<string, any>;
}

export class TemporaryMetadataResponseDto {
  id: string;
  data_id: string;
  user_id: string;
  organization_id?: string;
  session_id: string;
  metadata: string;
  is_processed: boolean;
  expires_at?: Date;
  original_name?: string;
  file_type?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  record_count?: number;
  fields?: string;
  sample_data?: string;
  processed_at?: Date;
  fields_encrypted: string[];
  self_destruct_script?: string;
  encrypted_file_path?: string;
  storage_config: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
