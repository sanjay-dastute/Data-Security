import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { HsmService } from './hsm.service';
import { HsmConfigDto, TestHsmConnectionDto } from './dto/hsm.dto';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import { Request } from 'express';

@Controller('hsm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HsmController {
  constructor(
    private readonly hsmService: HsmService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('config')
  @Roles(UserRole.ADMIN)
  async getHsmConfig() {
    return this.hsmService.getHsmConfig();
  }

  @Post('config')
  @Roles(UserRole.ADMIN)
  async saveHsmConfig(@Body() hsmConfigDto: HsmConfigDto, @Req() req: Request) {
    try {
      const result = await this.hsmService.saveHsmConfig(hsmConfigDto);
      
      // Log to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'hsm-config',
        user_id: req.user['userId'],
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          provider: hsmConfigDto.provider,
          enabled: hsmConfigDto.enabled,
        },
      });
      
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to save HSM configuration: ${error.message}`);
    }
  }

  @Post('test')
  @Roles(UserRole.ADMIN)
  async testHsmConnection(@Body() testHsmConnectionDto: TestHsmConnectionDto) {
    try {
      return await this.hsmService.testHsmConnection(testHsmConnectionDto);
    } catch (error) {
      throw new BadRequestException(`Failed to test HSM connection: ${error.message}`);
    }
  }
}
