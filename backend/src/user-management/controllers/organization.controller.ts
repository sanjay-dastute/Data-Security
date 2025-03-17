import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.organizationService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to access different org
    if (req.user.role === UserRole.ORG_ADMIN && req.user.organizationId !== id) {
      throw new Error('Unauthorized to access different organization');
    }
    
    return this.organizationService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto, @Request() req) {
    // Check if user is org admin and trying to update different org
    if (req.user.role === UserRole.ORG_ADMIN && req.user.organizationId !== id) {
      throw new Error('Unauthorized to update different organization');
    }
    
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }

  @Get(':id/users')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async getOrganizationUsers(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req
  ) {
    // Check if user is org admin and trying to access different org
    if (req.user.role === UserRole.ORG_ADMIN && req.user.organizationId !== id) {
      throw new Error('Unauthorized to access users from different organization');
    }
    
    return this.organizationService.getOrganizationUsers(id, page, limit);
  }
}
