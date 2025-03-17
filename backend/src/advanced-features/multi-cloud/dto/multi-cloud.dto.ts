import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum CloudProviderType {
  AWS = 'AWS',
  AZURE = 'AZURE',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
  ON_PREMISES = 'ON_PREMISES',
}

export class CloudProviderDto {
  @IsEnum(CloudProviderType)
  type: CloudProviderType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  accessKey?: string;

  @IsString()
  @IsOptional()
  secretKey?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientSecret?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  serviceAccountKey?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  resourceAllocation?: number;
}

export class CloudConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CloudProviderDto)
  providers: CloudProviderDto[];

  @IsBoolean()
  syncKeys: boolean;

  @IsBoolean()
  autoFailover: boolean;

  @IsString()
  @IsOptional()
  primaryProvider?: string;
}

export class TestConnectionDto {
  @IsEnum(CloudProviderType)
  type: CloudProviderType;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  accessKey?: string;

  @IsString()
  @IsOptional()
  secretKey?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientSecret?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  serviceAccountKey?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class DeploymentStatusDto {
  @IsString()
  provider: string;

  @IsString()
  status: 'deployed' | 'failed' | 'pending' | 'not_deployed';

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  @IsOptional()
  deployedAt?: string;
}
