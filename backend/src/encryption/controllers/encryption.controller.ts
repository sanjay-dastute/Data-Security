import { Controller, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { EncryptionService } from '../services/encryption.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';

@Controller('encryption')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncryptionController {
  constructor(private readonly encryptionService: EncryptionService) {}

  @Post('encrypt')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async encryptData(
    @Body() data: { 
      data: string | Record<string, any>; 
      keyId: string; 
      selectedFields?: string[];
    },
    @Request() req,
  ) {
    // Check if user has access to the key
    // This would be handled by a service in a real implementation
    
    return this.encryptionService.encryptData(
      data.data,
      data.keyId,
      data.selectedFields,
    );
  }

  @Post('decrypt')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async decryptData(
    @Body() data: { 
      encryptedData: string | Record<string, any>; 
      keyId: string; 
      encryptedFields?: string[];
    },
    @Request() req,
  ) {
    // Check if user has access to the key
    // This would be handled by a service in a real implementation
    
    return this.encryptionService.decryptData(
      data.encryptedData,
      data.keyId,
      data.encryptedFields,
    );
  }

  @Post('sign')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async signData(
    @Body() data: { 
      data: string; 
      keyId: string;
    },
    @Request() req,
  ) {
    // Check if user has access to the key
    // This would be handled by a service in a real implementation
    
    return this.encryptionService.signData(
      data.data,
      data.keyId,
    );
  }

  @Post('verify')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async verifySignature(
    @Body() data: { 
      data: string; 
      signature: string;
      keyId: string;
    },
    @Request() req,
  ) {
    // Check if user has access to the key
    // This would be handled by a service in a real implementation
    
    return this.encryptionService.verifySignature(
      data.data,
      data.signature,
      data.keyId,
    );
  }
}
