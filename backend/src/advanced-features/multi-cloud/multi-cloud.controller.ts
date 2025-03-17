import { Controller, Get, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { MultiCloudService } from './multi-cloud.service';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import { CloudConfigDto, TestConnectionDto } from './dto/multi-cloud.dto';
import { Request } from 'express';

@Controller('multi-cloud')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MultiCloudController {
  constructor(
    private readonly multiCloudService: MultiCloudService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('config')
  @Roles(UserRole.ADMIN)
  async getCloudConfig() {
    try {
      return await this.multiCloudService.getCloudConfig();
    } catch (error) {
      throw new BadRequestException(`Failed to get cloud configuration: ${error.message}`);
    }
  }

  @Post('config')
  @Roles(UserRole.ADMIN)
  async saveCloudConfig(@Body() cloudConfigDto: CloudConfigDto, @Req() req: Request) {
    try {
      const result = await this.multiCloudService.saveCloudConfig(cloudConfigDto);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'cloud-config',
        user_id: req.user ? req.user['userId'] : 'unknown',
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          providers: cloudConfigDto.providers.map(p => p.type),
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to save cloud configuration: ${error.message}`);
    }
  }

  @Post('test-connection')
  @Roles(UserRole.ADMIN)
  async testConnection(@Body() testConnectionDto: TestConnectionDto) {
    try {
      return await this.multiCloudService.testConnection(testConnectionDto);
    } catch (error) {
      throw new BadRequestException(`Failed to test cloud connection: ${error.message}`);
    }
  }

  @Get('providers')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async getAvailableProviders() {
    try {
      return await this.multiCloudService.getAvailableProviders();
    } catch (error) {
      throw new BadRequestException(`Failed to get available providers: ${error.message}`);
    }
  }

  @Get('status')
  @Roles(UserRole.ADMIN)
  async getCloudStatus() {
    try {
      return await this.multiCloudService.getCloudStatus();
    } catch (error) {
      throw new BadRequestException(`Failed to get cloud status: ${error.message}`);
    }
  }

  @Post('deploy/:provider')
  @Roles(UserRole.ADMIN)
  async deployToCloud(@Param('provider') provider: string, @Req() req: Request) {
    try {
      const result = await this.multiCloudService.deployToCloud(provider);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'cloud-deployment',
        user_id: req.user ? req.user['userId'] : 'unknown',
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          provider,
          status: 'deployed',
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to deploy to ${provider}: ${error.message}`);
    }
  }
}
