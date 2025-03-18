import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { DeploymentType } from '../entities/deployment-config.entity';

export class UpdateDeploymentConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DeploymentType)
  deployment_type?: DeploymentType;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_scaling_enabled?: boolean;

  // AWS specific fields
  @IsOptional()
  @IsString()
  aws_access_key_id?: string;

  @IsOptional()
  @IsString()
  aws_secret_access_key?: string;

  @IsOptional()
  @IsString()
  aws_region?: string;

  @IsOptional()
  @IsString()
  aws_s3_bucket?: string;

  // Azure specific fields
  @IsOptional()
  @IsString()
  azure_storage_connection_string?: string;

  @IsOptional()
  @IsString()
  azure_container_name?: string;

  // GCP specific fields
  @IsOptional()
  @IsString()
  gcp_project_id?: string;

  @IsOptional()
  @IsString()
  gcp_bucket_name?: string;

  // On-premises specific fields
  @IsOptional()
  @IsString()
  on_premises_sftp_host?: string;

  @IsOptional()
  @IsString()
  on_premises_sftp_username?: string;

  @IsOptional()
  @IsString()
  on_premises_sftp_password?: string;
}
