import { Controller, Post, Body, UseGuards, Request, BadRequestException, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { SelfDestructScriptGenerator } from '../utils/self-destruct';
import { BlockchainService } from '../../encryption/services/blockchain.service';
import { GenerateScriptDto, LogBreachDto } from '../interfaces/self-destruct.interface';

@Controller('self-destruct')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SelfDestructController {
  constructor(
    private readonly selfDestructScriptGenerator: SelfDestructScriptGenerator,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async generateScript(
    @Body() body: GenerateScriptDto,
    @Request() req,
  ) {
    try {
      let script: string;
      
      if (body.platform === 'javascript') {
        script = this.selfDestructScriptGenerator.generateJavaScriptScript({
          triggerCondition: body.triggerCondition,
          filePattern: body.filePattern,
          logEndpoint: body.logEndpoint,
        });
      } else {
        script = this.selfDestructScriptGenerator.generateScript(
          body.platform,
          {
            triggerCondition: body.triggerCondition,
            filePattern: body.filePattern,
            logEndpoint: body.logEndpoint,
          },
        );
      }
      
      // Log script generation to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'self-destruct',
        user_id: req.user.userId,
        event_type: 'created',
        timestamp: new Date(),
        metadata: {
          platform: body.platform,
          trigger_condition: body.triggerCondition,
          file_pattern: body.filePattern,
        },
      });
      
      return {
        script,
        message: 'Self-destruct script generated successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate self-destruct script: ${error.message}`);
    }
  }

  @Post('log-breach')
  async logBreach(
    @Body() body: LogBreachDto,
  ) {
    try {
      // Log breach to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: 'self-destruct',
        user_id: 'breach',
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          script_id: body.script_id,
          ip: body.ip,
          mac: body.mac,
          platform: body.platform,
        },
      });
      
      return {
        message: 'Breach logged successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to log breach: ${error.message}`);
    }
  }
}
