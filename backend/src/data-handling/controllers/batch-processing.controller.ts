import { Controller, Post, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { EncryptionService } from '../../encryption/services/encryption.service';
import { BatchProcessingService } from '../../advanced-features/batch-processing/batch-processing.service';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Controller('data/batch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatchProcessingController {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly batchProcessingService: BatchProcessingService,
  ) {}

  @Post('encrypt')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async batchEncrypt(@Body() data: any, @Req() req: RequestWithUser) {
    try {
      // Extract batch data
      const { items, fields, keyId, batchId } = data;
      
      if (!items || !Array.isArray(items) || !fields || !Array.isArray(fields) || !keyId) {
        throw new HttpException('Invalid request parameters', HttpStatus.BAD_REQUEST);
      }
      
      // Create batch process record
      const batchProcess = await this.batchProcessingService.createBatchProcess(
        req.user.userId,
        items.length,
        'encryption'
      );
      
      // Process each item in the batch
      const results = [];
      for (const item of items) {
        try {
          // Encrypt specified fields
          const encryptedItem = await this.encryptionService.encryptFields(
            item,
            fields,
            keyId,
            req.user.userId
          );
          
          results.push({
            success: true,
            original_id: item.id || null,
            data: encryptedItem,
          });
        } catch (error) {
          results.push({
            success: false,
            original_id: item.id || null,
            error: error.message,
          });
        }
      }
      
      // Update batch process status
      await this.batchProcessingService.completeBatchProcess(
        batchProcess.id,
        results.filter(r => r.success).length,
        results.filter(r => !r.success).length
      );
      
      return {
        success: true,
        message: 'Batch encryption completed',
        batch_id: batchProcess.id,
        total: items.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error) {
      throw new HttpException(
        `Batch encryption failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
