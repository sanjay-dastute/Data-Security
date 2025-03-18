import { Controller, Post, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { StorageService } from '../services/storage.service';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { StorageType } from '../dto/storage-response.dto';

@Controller('api/integration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiIntegrationController {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
  ) {}

  @Post('encrypt')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async encryptData(@Body() data: any, @Req() req: RequestWithUser) {
    try {
      // Extract fields to encrypt
      const { fields, keyId, storageConfig } = data;
      
      if (!fields || !Array.isArray(fields) || !keyId) {
        throw new HttpException('Invalid request parameters', HttpStatus.BAD_REQUEST);
      }
      
      // Encrypt specified fields
      const encryptedData = await this.encryptionService.encryptFields(
        data.payload,
        fields,
        keyId,
        req.user.userId
      );
      
      // Store encrypted data if storage config is provided
      if (storageConfig) {
        const storageResult = await this.storageService.storeData(
          encryptedData,
          storageConfig,
          req.user.userId,
          req.user.organizationId
        );
        
        return {
          success: true,
          message: 'Data encrypted and stored successfully',
          storage: storageResult,
        };
      }
      
      return {
        success: true,
        message: 'Data encrypted successfully',
        data: encryptedData,
      };
    } catch (error) {
      throw new HttpException(
        `API integration encryption failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
