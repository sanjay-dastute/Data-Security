import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsOptional, 
  ValidateNested, 
  IsBoolean,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CloudProvider {
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
  ON_PREMISES = 'on-premises',
}

export class AwsCredentialsDto {
  @ApiProperty({ description: 'AWS Access Key ID' })
  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @ApiProperty({ description: 'AWS Secret Access Key' })
  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @ApiProperty({ description: 'AWS Region' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: 'AWS EKS Cluster Name', required: false })
  @IsString()
  @IsOptional()
  eksClusterName?: string;

  @ApiProperty({ description: 'AWS ECR Repository URI', required: false })
  @IsString()
  @IsOptional()
  ecrRepositoryUri?: string;
}

export class AzureCredentialsDto {
  @ApiProperty({ description: 'Azure Subscription ID' })
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({ description: 'Azure Tenant ID' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ description: 'Azure Client ID' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Azure Client Secret' })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({ description: 'Azure Resource Group' })
  @IsString()
  @IsNotEmpty()
  resourceGroup: string;

  @ApiProperty({ description: 'Azure AKS Cluster Name', required: false })
  @IsString()
  @IsOptional()
  aksClusterName?: string;

  @ApiProperty({ description: 'Azure Container Registry Name', required: false })
  @IsString()
  @IsOptional()
  acrName?: string;
}

export class GcpCredentialsDto {
  @ApiProperty({ description: 'GCP Project ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'GCP Service Account Key (JSON as string)' })
  @IsString()
  @IsNotEmpty()
  serviceAccountKey: string;

  @ApiProperty({ description: 'GCP Region' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ description: 'GCP Zone' })
  @IsString()
  @IsNotEmpty()
  zone: string;

  @ApiProperty({ description: 'GCP GKE Cluster Name', required: false })
  @IsString()
  @IsOptional()
  gkeClusterName?: string;
}

export class OnPremisesCredentialsDto {
  @ApiProperty({ description: 'Kubernetes API Server URL' })
  @IsString()
  @IsNotEmpty()
  apiServerUrl: string;

  @ApiProperty({ description: 'Kubernetes API Token' })
  @IsString()
  @IsNotEmpty()
  apiToken: string;

  @ApiProperty({ description: 'Kubernetes Namespace' })
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty({ description: 'Container Registry URL', required: false })
  @IsString()
  @IsOptional()
  registryUrl?: string;

  @ApiProperty({ description: 'Container Registry Username', required: false })
  @IsString()
  @IsOptional()
  registryUsername?: string;

  @ApiProperty({ description: 'Container Registry Password', required: false })
  @IsString()
  @IsOptional()
  registryPassword?: string;
}

export class CreateDeploymentConfigDto {
  @ApiProperty({ description: 'Configuration name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Configuration description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CloudProvider, description: 'Cloud provider' })
  @IsEnum(CloudProvider)
  provider: CloudProvider;

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

  @ApiProperty({ description: 'Whether this is the default deployment configuration', default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: 'Number of replicas for deployment', default: 3, required: false })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  replicas?: number;

  @ApiProperty({ description: 'CPU limit for each pod (in cores)', default: 1, required: false })
  @IsNumber()
  @Min(0.1)
  @Max(4)
  @IsOptional()
  cpuLimit?: number;

  @ApiProperty({ description: 'Memory limit for each pod (in GB)', default: 2, required: false })
  @IsNumber()
  @Min(0.5)
  @Max(8)
  @IsOptional()
  memoryLimit?: number;
}
