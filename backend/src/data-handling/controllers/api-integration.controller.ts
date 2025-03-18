import { Controller, Post, Body, Headers, UseGuards, Req, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { StorageService } from '../services/storage.service';
import { RequireMtls } from '../../common/decorators/require-mtls.decorator';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageType } from '../dto/temporary-metadata.dto';
import { Organization } from '../../user-management/entities/organization.entity';

@ApiTags('API Integration')
@Controller('api')
export class ApiIntegrationController {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
    private readonly blockchainService: BlockchainService,
    private readonly configService: ConfigService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  @Post('encrypt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypt data via API' })
  @ApiHeader({ name: 'X-API-Key', description: 'QuantumTrust API Key (optional)' })
  @ApiHeader({ name: 'X-Org-API-Key', description: 'Organization API Key (required)' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @RequireMtls()
  async encryptData(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-org-api-key') orgApiKey: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    try {
      // Validate API keys
      if (!orgApiKey) {
        throw new UnauthorizedException('Organization API key is required');
      }
      
      // Find organization by API key
      const organization = await this.validateOrganizationApiKey(orgApiKey);
      if (!organization) {
        throw new UnauthorizedException('Invalid organization API key');
      }
      
      // Validate QuantumTrust API key if provided
      if (apiKey) {
        const isValidApiKey = await this.validateQuantumTrustApiKey(apiKey);
        if (!isValidApiKey) {
          throw new UnauthorizedException('Invalid API key');
        }
      }
      
      // Get client address for logging
      const clientAddress = req.clientAddress || { ip: req.ip, mac: 'unknown' };
      
      // Encrypt data
      const encryptionResult = await this.encryptionService.encryptData(
        data,
        organization.id,
        null, // No specific user ID for API requests
      );
      
      // Store encrypted data based on organization storage configuration
      const storageConfig = organization.settings?.storage_config || { provider: 'local' };
      const fileName = 'api-data.json';
      const storageType = storageConfig.provider || 'local';
      
      // Extract the encrypted data from the encryption result
      const encryptedDataBuffer = typeof encryptionResult.encryptedData === 'string' 
        ? Buffer.from(encryptionResult.encryptedData) 
        : Buffer.from(JSON.stringify(encryptionResult.encryptedData));
      
      const storageResult = await this.storageService.storeData(
        encryptedDataBuffer,
        fileName,
        StorageType.AWS_S3, // Using AWS_S3 as default storage type
        storageConfig,
        'api',
        organization.id
      );
      
      // Log the encryption event
      await this.blockchainService.logEvent({
        user_id: 'api',
        event_type: 'api_encryption',
        timestamp: new Date(),
        metadata: {
          organization_id: organization.id,
          ip: clientAddress.ip,
          mac: clientAddress.mac,
          storage_type: storageConfig.provider,
          storage_id: storageResult.storage_path,
        },
      });
      
      return {
        success: true,
        message: 'Data encrypted successfully',
        storage_id: storageResult.storage_path,
        storage_type: storageConfig.provider,
        storage_location: storageResult.storage_path,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Log the error
      console.error('API encryption error:', error.message);
      
      // Throw appropriate HTTP exception
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException(error.message);
    }
  }
  
  @Post('decrypt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrypt data via API' })
  @ApiHeader({ name: 'X-API-Key', description: 'QuantumTrust API Key (optional)' })
  @ApiHeader({ name: 'X-Org-API-Key', description: 'Organization API Key (required)' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @RequireMtls()
  async decryptData(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-org-api-key') orgApiKey: string,
    @Body() body: { storage_id: string },
    @Req() req: any,
  ) {
    try {
      // Validate API keys
      if (!orgApiKey) {
        throw new UnauthorizedException('Organization API key is required');
      }
      
      // Find organization by API key
      const organization = await this.validateOrganizationApiKey(orgApiKey);
      if (!organization) {
        throw new UnauthorizedException('Invalid organization API key');
      }
      
      // Validate QuantumTrust API key if provided
      if (apiKey) {
        const isValidApiKey = await this.validateQuantumTrustApiKey(apiKey);
        if (!isValidApiKey) {
          throw new UnauthorizedException('Invalid API key');
        }
      }
      
      // Get client address for logging
      const clientAddress = req.clientAddress || { ip: req.ip, mac: 'unknown' };
      
      // Get storage configuration
      const storageConfig = organization.settings?.storage_config || { provider: 'local' };
      
      // Retrieve encrypted data from storage - using a temporary implementation
      // TODO: Implement proper retrieveData method in StorageService
      const encryptedData = Buffer.from('encrypted-data-placeholder');
      
      // Decrypt data
      const decryptedData = await this.encryptionService.decryptData(
        encryptedData,
        organization.id
      );
      
      // Log the decryption event
      await this.blockchainService.logEvent({
        user_id: 'api',
        event_type: 'api_decryption',
        timestamp: new Date(),
        metadata: {
          organization_id: organization.id,
          ip: clientAddress.ip,
          mac: clientAddress.mac,
          storage_type: storageConfig.provider,
          storage_id: body.storage_id,
        },
      });
      
      return {
        success: true,
        message: 'Data decrypted successfully',
        data: decryptedData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Log the error
      console.error('API decryption error:', error.message);
      
      // Throw appropriate HTTP exception
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException(error.message);
    }
  }
  
  @Post('detect-breach')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect and handle breach attempts' })
  @ApiResponse({ status: 200, description: 'Breach detected and handled' })
  async detectBreach(@Body() body: any, @Req() req: any) {
    try {
      // Get client address
      const clientIp = req.ip;
      const clientMac = req.headers['x-client-mac'] || 'unknown';
      
      // Log the breach event
      await this.blockchainService.logEvent({
        user_id: body.user_id || 'unknown',
        event_type: 'security_breach',
        timestamp: new Date(),
        metadata: {
          ip: clientIp,
          mac: clientMac,
          breach_type: body.breach_type || 'unknown',
          details: body.details || {},
        },
      });
      
      // Return success without revealing any sensitive information
      return {
        status: 'processed',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Breach detection error:', error.message);
      
      // Always return success to prevent information leakage
      return {
        status: 'processed',
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  // Helper methods for API key validation
  private async validateQuantumTrustApiKey(apiKey: string): Promise<boolean> {
    try {
      // Get master API key from environment
      const masterApiKey = this.configService.get<string>('MASTER_API_KEY');
      
      if (!masterApiKey) {
        return false;
      }
      
      // Compare API keys
      return apiKey === masterApiKey;
    } catch (error) {
      return false;
    }
  }
  
  private async validateOrganizationApiKey(orgApiKey: string): Promise<Organization | null> {
    try {
      // Find organization with matching API key
      const organizations = await this.organizationRepository.find();
      
      for (const org of organizations) {
        if (org.settings && org.settings.api_key === orgApiKey) {
          return org;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
