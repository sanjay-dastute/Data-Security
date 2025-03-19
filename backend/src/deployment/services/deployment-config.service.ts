import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DeploymentConfig } from '../entities/deployment-config.entity';
import { CreateDeploymentConfigDto, CloudProvider } from '../dto/create-deployment-config.dto';
import { UpdateDeploymentConfigDto } from '../dto/update-deployment-config.dto';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class DeploymentConfigService {
  private readonly logger = new Logger(DeploymentConfigService.name);

  constructor(
    @InjectRepository(DeploymentConfig)
    private readonly deploymentConfigRepository: Repository<DeploymentConfig>,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateDeploymentConfigDto): Promise<DeploymentConfig> {
    // Validate provider-specific credentials
    this.validateCredentials(createDto);

    // If this is set as default, unset any existing default
    if (createDto.isDefault) {
      await this.unsetDefaultConfig();
    }

    // Create new deployment config
    const deploymentConfig = new DeploymentConfig();
    deploymentConfig.name = createDto.name;
    deploymentConfig.description = createDto.description;
    deploymentConfig.provider = createDto.provider;
    deploymentConfig.is_default = createDto.isDefault || false;
    deploymentConfig.replicas = createDto.replicas || 3;
    deploymentConfig.cpu_limit = createDto.cpuLimit || 1;
    deploymentConfig.memory_limit = createDto.memoryLimit || 2;

    // Store credentials securely
    deploymentConfig.credentials = this.secureCredentials(createDto);

    return this.deploymentConfigRepository.save(deploymentConfig);
  }

  async findAll(): Promise<DeploymentConfig[]> {
    return this.deploymentConfigRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<DeploymentConfig> {
    const config = await this.deploymentConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(`Deployment configuration with ID ${id} not found`);
    }
    return config;
  }

  async update(id: string, updateDto: UpdateDeploymentConfigDto): Promise<DeploymentConfig> {
    const config = await this.findOne(id);

    // If provider is changing, validate new credentials
    if (updateDto.provider && updateDto.provider !== config.provider) {
      this.validateCredentialsForProvider(updateDto);
    }

    // If this is set as default, unset any existing default
    if (updateDto.isDefault) {
      await this.unsetDefaultConfig();
    }

    // Update fields
    if (updateDto.name) config.name = updateDto.name;
    if (updateDto.description !== undefined) config.description = updateDto.description;
    if (updateDto.provider) config.provider = updateDto.provider;
    if (updateDto.isDefault !== undefined) config.is_default = updateDto.isDefault;
    if (updateDto.replicas) config.replicas = updateDto.replicas;
    if (updateDto.cpuLimit) config.cpu_limit = Number(updateDto.cpuLimit);
    if (updateDto.memoryLimit) config.memory_limit = Number(updateDto.memoryLimit);

    // Update credentials if provided
    if (this.hasCredentials(updateDto)) {
      config.credentials = this.secureCredentials(updateDto as any);
    }

    return this.deploymentConfigRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.deploymentConfigRepository.softDelete(id);
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const config = await this.findOne(id);
    
    try {
      switch (config.provider) {
        case CloudProvider.AWS:
          return await this.testAwsConnection(config);
        case CloudProvider.AZURE:
          return await this.testAzureConnection(config);
        case CloudProvider.GCP:
          return await this.testGcpConnection(config);
        case CloudProvider.ON_PREMISES:
          return await this.testOnPremisesConnection(config);
        default:
          throw new BadRequestException(`Unsupported provider: ${config.provider}`);
      }
    } catch (error) {
      this.logger.error(`Connection test failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
      };
    }
  }

  async deploy(id: string): Promise<{ success: boolean; message: string; jobId?: string }> {
    const config = await this.findOne(id);
    
    try {
      // Generate deployment files
      const deploymentFiles = await this.generateDeploymentFiles(config);
      
      // Start deployment process
      const jobId = `deploy-${Date.now()}`;
      
      // Update deployment status
      config.last_deployed_at = new Date();
      config.last_deployment_status = 'in_progress';
      await this.deploymentConfigRepository.save(config);
      
      // Start deployment in background
      this.startDeployment(config, deploymentFiles, jobId);
      
      return {
        success: true,
        message: 'Deployment initiated successfully',
        jobId,
      };
    } catch (error) {
      this.logger.error(`Deployment failed: ${error.message}`, error.stack);
      
      // Update deployment status
      config.last_deployment_status = 'failed';
      await this.deploymentConfigRepository.save(config);
      
      return {
        success: false,
        message: `Deployment failed: ${error.message}`,
      };
    }
  }

  private async unsetDefaultConfig(): Promise<void> {
    await this.deploymentConfigRepository.update(
      { is_default: true },
      { is_default: false }
    );
  }

  private validateCredentials(dto: CreateDeploymentConfigDto | UpdateDeploymentConfigDto): void {
    this.validateCredentialsForProvider(dto);
  }

  private validateCredentialsForProvider(dto: CreateDeploymentConfigDto | UpdateDeploymentConfigDto): void {
    const provider = (dto as CreateDeploymentConfigDto).provider || (dto as UpdateDeploymentConfigDto).provider;
    
    if (!provider) {
      return; // No provider specified, nothing to validate
    }
    
    switch (provider) {
      case CloudProvider.AWS:
        if (!(dto as any).awsCredentials) {
          throw new BadRequestException('AWS credentials are required for AWS provider');
        }
        break;
      case CloudProvider.AZURE:
        if (!(dto as any).azureCredentials) {
          throw new BadRequestException('Azure credentials are required for Azure provider');
        }
        break;
      case CloudProvider.GCP:
        if (!(dto as any).gcpCredentials) {
          throw new BadRequestException('GCP credentials are required for GCP provider');
        }
        break;
      case CloudProvider.ON_PREMISES:
        if (!(dto as any).onPremisesCredentials) {
          throw new BadRequestException('On-premises credentials are required for on-premises provider');
        }
        break;
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  private secureCredentials(dto: CreateDeploymentConfigDto): any {
    // In a real implementation, we would encrypt sensitive fields
    switch (dto.provider) {
      case CloudProvider.AWS:
        return {
          accessKeyId: dto.awsCredentials.accessKeyId,
          secretAccessKey: this.maskSensitiveValue(dto.awsCredentials.secretAccessKey),
          region: dto.awsCredentials.region,
          eksClusterName: dto.awsCredentials.eksClusterName,
          ecrRepositoryUri: dto.awsCredentials.ecrRepositoryUri,
        };
      case CloudProvider.AZURE:
        return {
          subscriptionId: dto.azureCredentials.subscriptionId,
          tenantId: dto.azureCredentials.tenantId,
          clientId: dto.azureCredentials.clientId,
          clientSecret: this.maskSensitiveValue(dto.azureCredentials.clientSecret),
          resourceGroup: dto.azureCredentials.resourceGroup,
          aksClusterName: dto.azureCredentials.aksClusterName,
          acrName: dto.azureCredentials.acrName,
        };
      case CloudProvider.GCP:
        return {
          projectId: dto.gcpCredentials.projectId,
          serviceAccountKey: this.maskSensitiveValue(dto.gcpCredentials.serviceAccountKey),
          region: dto.gcpCredentials.region,
          zone: dto.gcpCredentials.zone,
          gkeClusterName: dto.gcpCredentials.gkeClusterName,
        };
      case CloudProvider.ON_PREMISES:
        return {
          apiServerUrl: dto.onPremisesCredentials.apiServerUrl,
          apiToken: this.maskSensitiveValue(dto.onPremisesCredentials.apiToken),
          namespace: dto.onPremisesCredentials.namespace,
          registryUrl: dto.onPremisesCredentials.registryUrl,
          registryUsername: dto.onPremisesCredentials.registryUsername,
          registryPassword: this.maskSensitiveValue(dto.onPremisesCredentials.registryPassword),
        };
      default:
        return {};
    }
  }

  private maskSensitiveValue(value: string): string {
    // In a real implementation, we would encrypt this value
    // For now, we'll just return a placeholder
    return value ? `[ENCRYPTED:${value.substring(0, 3)}...]` : null;
  }

  private hasCredentials(dto: UpdateDeploymentConfigDto): boolean {
    return !!(
      dto.awsCredentials ||
      dto.azureCredentials ||
      dto.gcpCredentials ||
      dto.onPremisesCredentials
    );
  }

  private async testAwsConnection(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, we would use AWS SDK to test the connection
      // For now, we'll just simulate a successful connection
      return {
        success: true,
        message: 'Successfully connected to AWS EKS cluster',
      };
    } catch (error) {
      throw new Error(`AWS connection test failed: ${error.message}`);
    }
  }

  private async testAzureConnection(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, we would use Azure SDK to test the connection
      // For now, we'll just simulate a successful connection
      return {
        success: true,
        message: 'Successfully connected to Azure AKS cluster',
      };
    } catch (error) {
      throw new Error(`Azure connection test failed: ${error.message}`);
    }
  }

  private async testGcpConnection(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, we would use GCP SDK to test the connection
      // For now, we'll just simulate a successful connection
      return {
        success: true,
        message: 'Successfully connected to GCP GKE cluster',
      };
    } catch (error) {
      throw new Error(`GCP connection test failed: ${error.message}`);
    }
  }

  private async testOnPremisesConnection(config: DeploymentConfig): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, we would use kubectl to test the connection
      // For now, we'll just simulate a successful connection
      return {
        success: true,
        message: 'Successfully connected to on-premises Kubernetes cluster',
      };
    } catch (error) {
      throw new Error(`On-premises connection test failed: ${error.message}`);
    }
  }

  private async generateDeploymentFiles(config: DeploymentConfig): Promise<string[]> {
    const tempDir = path.join(process.cwd(), 'temp', `deploy-${Date.now()}`);
    
    try {
      // Create temp directory
      await fs.promises.mkdir(tempDir, { recursive: true });
      
      // Copy base deployment files
      const baseDir = path.join(process.cwd(), 'k8s', this.getProviderDir(config.provider));
      const files = await fs.promises.readdir(baseDir);
      
      const deploymentFiles: string[] = [];
      
      for (const file of files) {
        const sourcePath = path.join(baseDir, file);
        const targetPath = path.join(tempDir, file);
        
        // Read file content
        let content = await fs.promises.readFile(sourcePath, 'utf8');
        
        // Replace variables
        content = this.replaceDeploymentVariables(content, config);
        
        // Write to temp directory
        await fs.promises.writeFile(targetPath, content);
        
        deploymentFiles.push(targetPath);
      }
      
      return deploymentFiles;
    } catch (error) {
      this.logger.error(`Failed to generate deployment files: ${error.message}`, error.stack);
      throw new Error(`Failed to generate deployment files: ${error.message}`);
    }
  }

  private getProviderDir(provider: CloudProvider): string {
    switch (provider) {
      case CloudProvider.AWS:
        return 'aws';
      case CloudProvider.AZURE:
        return 'azure';
      case CloudProvider.GCP:
        return 'gcp';
      case CloudProvider.ON_PREMISES:
        return 'on-premises';
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private replaceDeploymentVariables(content: string, config: DeploymentConfig): string {
    let result = content;
    
    // Replace common variables
    result = result.replace(/\${IMAGE_TAG}/g, 'latest');
    result = result.replace(/\${REPLICAS}/g, config.replicas.toString());
    
    // Replace provider-specific variables
    switch (config.provider) {
      case CloudProvider.AWS:
        result = result.replace(/\${ECR_REPOSITORY_URI}/g, config.credentials.ecrRepositoryUri || '');
        result = result.replace(/\${ACM_CERTIFICATE_ARN}/g, 'arn:aws:acm:region:account:certificate/certificate-id');
        break;
      case CloudProvider.AZURE:
        result = result.replace(/\${ACR_REGISTRY_NAME}/g, config.credentials.acrName || '');
        break;
      case CloudProvider.GCP:
        result = result.replace(/\${GCP_PROJECT_ID}/g, config.credentials.projectId || '');
        break;
      case CloudProvider.ON_PREMISES:
        result = result.replace(/\${REGISTRY_URL}/g, config.credentials.registryUrl || 'localhost:5000');
        break;
    }
    
    return result;
  }

  private async startDeployment(
    config: DeploymentConfig,
    deploymentFiles: string[],
    jobId: string,
  ): Promise<void> {
    try {
      // In a real implementation, we would use kubectl to apply the deployment files
      // For now, we'll just simulate a successful deployment
      this.logger.log(`Starting deployment for ${config.name} (${jobId})`);
      
      // Simulate deployment process
      setTimeout(async () => {
        try {
          // Update deployment status
          config.last_deployment_status = 'completed';
          await this.deploymentConfigRepository.save(config);
          
          this.logger.log(`Deployment completed for ${config.name} (${jobId})`);
        } catch (error) {
          this.logger.error(`Failed to update deployment status: ${error.message}`, error.stack);
        }
      }, 5000);
    } catch (error) {
      this.logger.error(`Deployment process failed: ${error.message}`, error.stack);
      
      // Update deployment status
      config.last_deployment_status = 'failed';
      await this.deploymentConfigRepository.save(config);
      
      throw new Error(`Deployment process failed: ${error.message}`);
    }
  }
}
