import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('org-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORG_ADMIN)
export class OrgUsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    // Org admins can only see users in their organization
    return this.userService.findAllByOrganization(req.user.organizationId, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Org admins can only view users in their organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('You do not have permission to view this user');
    }
    
    return user;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Org admins can only create users in their organization
    createUserDto.organizationId = req.user.organizationId;
    
    // Org admins can only create ORG_USER role users
    createUserDto.role = UserRole.ORG_USER;
    
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.userService.findOne(id);
    
    // Org admins can only update users in their organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('You do not have permission to update this user');
    }
    
    // Org admins cannot change organization or role
    delete updateUserDto.organizationId;
    delete updateUserDto.role;
    
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Org admins can only delete users in their organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('You do not have permission to delete this user');
    }
    
    return this.userService.remove(id);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Org admins can only deactivate users in their organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('You do not have permission to deactivate this user');
    }
    
    return this.userService.update(id, { isActivated: false });
  }
}
