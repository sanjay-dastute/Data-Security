import { Controller, Post, Body, UseGuards, Request, BadRequestException, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { TemporaryMetadataService } from '../services/temporary-metadata.service';
import { FileParserService } from '../services/file-parser.service';
import { StorageService } from '../services/storage.service';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { KeyService } from '../../encryption/services/key.service';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import * as fs from 'fs';
import * as path from 'path';
import { StorageType, DataFormat } from '../dto/temporary-metadata.dto';

@Controller('data-encryption')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataEncryptionController {
  constructor(
    private readonly temporaryMetadataService: TemporaryMetadataService,
    private readonly fileParserService: FileParserService,
    private readonly storageService: StorageService,
    private readonly encryptionService: EncryptionService,
    private readonly keyService: KeyService,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Get data format from file type
   */
  private getDataFormatFromFileType(fileType: string): DataFormat {
    if (fileType.includes('json')) {
      return DataFormat.JSON;
    } else if (fileType.includes('csv')) {
      return DataFormat.CSV;
    } else if (fileType.includes('xml')) {
      return DataFormat.XML;
    } else if (fileType.includes('text')) {
      return DataFormat.TEXT;
    } else {
      return DataFormat.BINARY;
    }
  }

  @Get('metadata/:id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async getMetadata(@Param('id') id: string, @Request() req) {
    const metadata = await this.temporaryMetadataService.findOne(id);
    
    // Check if user has access to this metadata
    if (req.user.role !== UserRole.ADMIN) {
      if (metadata.user_id !== req.user.userId) {
        throw new BadRequestException('You do not have access to this metadata');
      }
    }
    
    return metadata;
  }

  @Post('select-fields')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async selectFields(
    @Body() body: { metadataId: string; selectedFields: string[] },
    @Request() req,
  ) {
    const metadata = await this.temporaryMetadataService.findOne(body.metadataId);
    
    // Check if user has access to this metadata
    if (req.user.role !== UserRole.ADMIN) {
      if (metadata.user_id !== req.user.userId) {
        throw new BadRequestException('You do not have access to this metadata');
      }
    }
    
    // Update metadata with selected fields
    const updatedMetadata = await this.temporaryMetadataService.update(body.metadataId, {
      fields_encrypted: body.selectedFields,
    });
    
    return {
      metadata: updatedMetadata,
      message: 'Fields selected successfully',
    };
  }

  @Post('encrypt')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async encryptData(
    @Body() body: { 
      metadataId: string; 
      keyId: string;
      storageConfig?: {
        storageType: StorageType;
        config: Record<string, any>;
      };
    },
    @Request() req,
  ) {
    try {
      // Get metadata
      const metadata = await this.temporaryMetadataService.findOne(body.metadataId);
      
      // Check if user has access to this metadata
      if (req.user.role !== UserRole.ADMIN) {
        if (metadata.user_id !== req.user.userId) {
          throw new BadRequestException('You do not have access to this metadata');
        }
      }
      
      // Check if file exists
      if (!metadata.encrypted_file_path || !fs.existsSync(metadata.encrypted_file_path)) {
        throw new BadRequestException('File not found');
      }
      
      // Parse file based on file type
      const dataFormat = this.getDataFormatFromFileType(metadata.file_type);
      const { data } = await this.fileParserService.parseFile(
        metadata.encrypted_file_path,
        dataFormat,
      );
      
      // Get key
      const key = await this.keyService.findOneResponse(body.keyId);
      
      // Update key last used timestamp
      await this.keyService.updateLastUsed(body.keyId);
      
      // Encrypt data
      const { encryptedData, encryptedFields } = await this.encryptionService.encryptData(
        data,
        body.keyId,
        metadata.fields_encrypted,
      );
      
      // Generate output file name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const outputFileName = `encrypted_${path.parse(metadata.file_name).name}_${timestamp}${path.extname(metadata.file_name)}`;
      
      // Convert encrypted data to string/buffer
      let outputData: string | Buffer;
      if (typeof encryptedData === 'string') {
        outputData = encryptedData;
      } else {
        outputData = JSON.stringify(encryptedData);
      }
      
      // Store encrypted data
      const storageType = body.storageConfig?.storageType || StorageType.ON_PREMISES;
      const storageConfig = body.storageConfig?.config || metadata.storage_config || {};
      
      const storageResult = await this.storageService.storeData(
        outputData,
        outputFileName,
        storageType,
        storageConfig,
        req.user.userId,
      );
      
      // Log encryption to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: body.keyId,
        user_id: req.user.userId,
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          file_name: outputFileName,
          encrypted_fields: encryptedFields,
          storage_path: storageResult.storage_path,
        },
      });
      
      // Update metadata with encrypted file path
      await this.temporaryMetadataService.update(body.metadataId, {
        encrypted_file_path: storageResult.storage_path,
        fields_encrypted: encryptedFields,
      });
      
      return {
        status: 'success',
        message: 'Data encrypted and stored successfully',
        storage_path: storageResult.storage_path,
        storage_type: storageResult.storage_type,
        fields_encrypted: encryptedFields,
        file_name: outputFileName,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to encrypt data: ${error.message}`);
    }
  }
  
  @Post('batch-encrypt')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async batchEncryptData(
    @Body() body: { 
      metadataIds: string[]; 
      keyId: string;
      storageConfig?: {
        storageType: StorageType;
        config: Record<string, any>;
      };
    },
    @Request() req,
  ) {
    try {
      const results = [];
      const errors = [];
      
      // Process each metadata ID
      for (const metadataId of body.metadataIds) {
        try {
          // Get metadata
          const metadata = await this.temporaryMetadataService.findOne(metadataId);
          
          // Check if user has access to this metadata
          if (req.user.role !== UserRole.ADMIN) {
            if (metadata.user_id !== req.user.userId) {
              errors.push({
                metadataId,
                error: 'You do not have access to this metadata',
              });
              continue;
            }
          }
          
          // Check if file exists
          if (!metadata.encrypted_file_path || !fs.existsSync(metadata.encrypted_file_path)) {
            errors.push({
              metadataId,
              error: 'File not found',
            });
            continue;
          }
          
          // Parse file based on file type
          const dataFormat = this.getDataFormatFromFileType(metadata.file_type);
          const { data } = await this.fileParserService.parseFile(
            metadata.encrypted_file_path,
            dataFormat,
          );
          
          // Encrypt data
          const { encryptedData, encryptedFields } = await this.encryptionService.encryptData(
            data,
            body.keyId,
            metadata.fields_encrypted,
          );
          
          // Generate output file name
          const timestamp = new Date().toISOString().replace(/[:.]/g, '');
          const outputFileName = `encrypted_${path.parse(metadata.file_name).name}_${timestamp}${path.extname(metadata.file_name)}`;
          
          // Convert encrypted data to string/buffer
          let outputData: string | Buffer;
          if (typeof encryptedData === 'string') {
            outputData = encryptedData;
          } else {
            outputData = JSON.stringify(encryptedData);
          }
          
          // Store encrypted data
          const storageType = body.storageConfig?.storageType || StorageType.ON_PREMISES;
          const storageConfig = body.storageConfig?.config || metadata.storage_config || {};
          
          const storageResult = await this.storageService.storeData(
            outputData,
            outputFileName,
            storageType,
            storageConfig,
            req.user.userId,
          );
          
          // Log encryption to blockchain
          await this.blockchainService.logKeyEvent({
            key_id: body.keyId,
            user_id: req.user.userId,
            event_type: 'updated',
            timestamp: new Date(),
            metadata: {
              file_name: outputFileName,
              encrypted_fields: encryptedFields,
              storage_path: storageResult.storage_path,
            },
          });
          
          // Update metadata with encrypted file path
          await this.temporaryMetadataService.update(metadataId, {
            encrypted_file_path: storageResult.storage_path,
            fields_encrypted: encryptedFields,
          });
          
          // Add to results
          results.push({
            metadataId,
            status: 'success',
            storage_path: storageResult.storage_path,
            storage_type: storageResult.storage_type,
            fields_encrypted: encryptedFields,
            file_name: outputFileName,
          });
        } catch (error) {
          errors.push({
            metadataId,
            error: error.message,
          });
        }
      }
      
      // Update key last used timestamp
      await this.keyService.updateLastUsed(body.keyId);
      
      return {
        status: 'completed',
        total: body.metadataIds.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to batch encrypt data: ${error.message}`);
    }
  }
}
