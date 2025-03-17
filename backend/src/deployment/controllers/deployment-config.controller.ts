import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { DeploymentConfigService } from '../services/deployment-config.service';
import { CreateDeploymentConfigDto } from '../dto/create-deployment-config.dto';
import { UpdateDeploymentConfigDto } from '../dto/update-deployment-config.dto';

@ApiTags('Deployment Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('deployment/config')
export class DeploymentConfigController {
  constructor(private readonly deploymentConfigService: DeploymentConfigService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new deployment configuration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Configuration created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid configuration data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async create(@Body() createDeploymentConfigDto: CreateDeploymentConfigDto) {
    return this.deploymentConfigService.create(createDeploymentConfigDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deployment configurations' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configurations retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findAll() {
    return this.deploymentConfigService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a deployment configuration by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuration not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return this.deploymentConfigService.findOne(id);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a deployment configuration' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Configuration updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid configuration data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuration not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateDeploymentConfigDto: UpdateDeploymentConfigDto,
  ) {
    return this.deploymentConfigService.update(id, updateDeploymentConfigDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a deployment configuration' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Configuration deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuration not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.deploymentConfigService.remove(id);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test a deployment configuration connection' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Connection test successful' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Connection test failed' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuration not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async testConnection(@Param('id') id: string) {
    return this.deploymentConfigService.testConnection(id);
  }

  @Post(':id/deploy')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Deploy to the configured environment' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Deployment initiated' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Deployment failed to start' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Configuration not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async deploy(@Param('id') id: string) {
    return this.deploymentConfigService.deploy(id);
  }
}
