import { Controller, Post, Body, UseGuards, Req, BadRequestException, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { SelfDestructService } from './self-destruct.service';
import { Request } from 'express';

@Controller('self-destruct')
export class SelfDestructController {
  constructor(private readonly selfDestructService: SelfDestructService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async generateSelfDestructScript(
    @Body() body: {
      fileId: string;
      authorizedIPs?: string;
      authorizedMACs?: string;
      scriptType?: 'js' | 'ps1' | 'sh';
      filePath?: string;
    },
    @Req() req: Request,
  ) {
    try {
      const { fileId, authorizedIPs, authorizedMACs, scriptType, filePath } = body;
      
      if (!fileId) {
        throw new BadRequestException('File ID is required');
      }
      
      const script = await this.selfDestructService.generateSelfDestructScript(
        fileId,
        authorizedIPs || '',
        authorizedMACs || '',
        scriptType || 'js',
        filePath,
      );
      
      return {
        script,
        scriptType: scriptType || 'js',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate self-destruct script: ${error.message}`);
    }
  }

  @Post('detect-breach')
  async detectBreach(
    @Body() body: {
      file_id: string;
      ip: string;
      mac: string;
      timestamp: string;
    },
  ) {
    try {
      // Log breach detection
      console.log(`Breach detected for file ${body.file_id} from IP ${body.ip} and MAC ${body.mac} at ${body.timestamp}`);
      
      // In a real implementation, this would log to a database and notify administrators
      
      return {
        success: true,
        message: 'Breach detected and logged',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to process breach detection: ${error.message}`);
    }
  }
}
