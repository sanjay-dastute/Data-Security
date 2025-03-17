import { 
  Controller, 
  Get, 
  Param, 
  UseGuards, 
  HttpStatus,
  Query,
  HttpException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { DeploymentStatusService } from '../services/deployment-status.service';
import { DeploymentStatusDto } from '../dto/deployment-status.dto';

@ApiTags('Deployment Status')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('deployment/status')
export class DeploymentStatusController {
  constructor(private readonly deploymentStatusService: DeploymentStatusService) {}

  @Get()
  @ApiOperation({ summary: 'Get all deployment statuses' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statuses retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findAll(
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.deploymentStatusService.findAll(limit, offset);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get deployment status by job ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Status not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findOne(@Param('jobId') jobId: string): Promise<DeploymentStatusDto> {
    const status = await this.deploymentStatusService.findOne(jobId);
    if (!status) {
      throw new HttpException(`Deployment status with job ID ${jobId} not found`, HttpStatus.NOT_FOUND);
    }
    return status;
  }

  @Get(':jobId/logs')
  @ApiOperation({ summary: 'Get deployment logs by job ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Logs not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async getLogs(@Param('jobId') jobId: string): Promise<{ logs: string }> {
    const logs = await this.deploymentStatusService.getLogs(jobId);
    if (!logs) {
      throw new HttpException(`Logs for deployment job ID ${jobId} not found`, HttpStatus.NOT_FOUND);
    }
    return { logs };
  }
}
