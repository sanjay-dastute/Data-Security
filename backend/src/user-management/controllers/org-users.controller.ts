import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Controller('org/:orgId/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORG_ADMIN)
export class OrgUsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @Param('orgId') orgId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to access users from this organization');
    }
    
    return this.userService.findByOrganization(orgId, page, limit);
  }

  @Get(':id')
  async findOne(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to access users from this organization');
    }
    
    const user = await this.userService.findOne(id);
    
    // Verify that the user belongs to this organization
    if (user.organization_id !== orgId) {
      throw new ForbiddenException('User does not belong to this organization');
    }
    
    return user;
  }

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @Body() createUserDto: CreateUserDto,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to create users for this organization');
    }
    
    // Force the organization_id to match the URL parameter
    createUserDto.organization_id = orgId;
    
    // Force the role to be org_user (org admins can only create org users)
    createUserDto.role = UserRole.ORG_USER;
    
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to update users from this organization');
    }
    
    const user = await this.userService.findOne(id);
    
    // Verify that the user belongs to this organization
    if (user.organization_id !== orgId) {
      throw new ForbiddenException('User does not belong to this organization');
    }
    
    // Prevent changing the organization_id
    delete updateUserDto.organization_id;
    
    // Prevent changing the role to anything other than org_user
    if (updateUserDto.role && updateUserDto.role !== UserRole.ORG_USER) {
      throw new ForbiddenException('Org admins can only manage org users');
    }
    
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to delete users from this organization');
    }
    
    const user = await this.userService.findOne(id);
    
    // Verify that the user belongs to this organization
    if (user.organization_id !== orgId) {
      throw new ForbiddenException('User does not belong to this organization');
    }
    
    // Prevent deleting org admins
    if (user.role === UserRole.ORG_ADMIN) {
      throw new ForbiddenException('Org admins cannot delete other org admins');
    }
    
    return this.userService.remove(id);
  }

  @Put(':id/activate')
  async activateUser(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to activate users from this organization');
    }
    
    const user = await this.userService.findOne(id);
    
    // Verify that the user belongs to this organization
    if (user.organization_id !== orgId) {
      throw new ForbiddenException('User does not belong to this organization');
    }
    
    return this.userService.activateUser(id);
  }

  @Put(':id/deactivate')
  async deactivateUser(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    // Verify that the org admin belongs to this organization
    if (req.user.organizationId !== orgId) {
      throw new ForbiddenException('You do not have permission to deactivate users from this organization');
    }
    
    const user = await this.userService.findOne(id);
    
    // Verify that the user belongs to this organization
    if (user.organization_id !== orgId) {
      throw new ForbiddenException('User does not belong to this organization');
    }
    
    return this.userService.deactivateUser(id);
  }
}
