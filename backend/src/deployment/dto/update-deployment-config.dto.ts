import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { 
  CloudProvider, 
  AwsCredentialsDto, 
  AzureCredentialsDto, 
  GcpCredentialsDto, 
  OnPremisesCredentialsDto 
} from './create-deployment-config.dto';

export class UpdateDeploymentConfigDto {
  @ApiProperty({ description: 'Configuration name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Configuration description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CloudProvider, description: 'Cloud provider', required: false })
  @IsEnum(CloudProvider)
  @IsOptional()
  provider?: CloudProvider;

  @ApiProperty({ description: 'AWS credentials', required: false })
  @ValidateNested()
  @Type(() => AwsCredentialsDto)
  @IsOptional()
  awsCredentials?: AwsCredentialsDto;

  @ApiProperty({ description: 'Azure credentials', required: false })
  @ValidateNested()
  @Type(() => AzureCredentialsDto)
  @IsOptional()
  azureCredentials?: AzureCredentialsDto;

  @ApiProperty({ description: 'GCP credentials', required: false })
  @ValidateNested()
  @Type(() => GcpCredentialsDto)
  @IsOptional()
  gcpCredentials?: GcpCredentialsDto;

  @ApiProperty({ description: 'On-premises credentials', required: false })
  @ValidateNested()
  @Type(() => OnPremisesCredentialsDto)
  @IsOptional()
  onPremisesCredentials?: OnPremisesCredentialsDto;

  @ApiProperty({ description: 'Whether this is the default deployment configuration', required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: 'Number of replicas for the deployment', required: false })
  @IsOptional()
  replicas?: number;

  @ApiProperty({ description: 'CPU limit for the deployment', required: false })
  @IsOptional()
  cpuLimit?: string;

  @ApiProperty({ description: 'Memory limit for the deployment', required: false })
  @IsOptional()
  memoryLimit?: string;
}
