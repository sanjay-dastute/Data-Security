import { IsString, IsUUID, IsOptional, IsArray, IsObject, IsEnum } from 'class-validator';

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

export class CreateTemporaryMetadataDto {
  @IsString()
  file_name: string;

  @IsString()
  file_type: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsArray()
  fields_encrypted?: string[];

  @IsOptional()
  @IsString()
  encrypted_file_path?: string;

  @IsOptional()
  @IsString()
  self_destruct_script?: string;

  @IsOptional()
  @IsObject()
  storage_config?: Record<string, any>;
}

export class UpdateTemporaryMetadataDto {
  @IsOptional()
  @IsArray()
  fields_encrypted?: string[];

  @IsOptional()
  @IsString()
  encrypted_file_path?: string;

  @IsOptional()
  @IsString()
  self_destruct_script?: string;

  @IsOptional()
  @IsObject()
  storage_config?: Record<string, any>;
}

export class TemporaryMetadataResponseDto {
  data_id: string;
  file_name: string;
  file_type: string;
  user_id: string;
  fields_encrypted: string[];
  encrypted_file_path?: string;
  self_destruct_script?: string;
  storage_config: Record<string, any>;
  created_at: Date;
  file_content?: string | Buffer;
}
