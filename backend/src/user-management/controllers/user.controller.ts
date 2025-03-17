import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('role') role?: UserRole) {
    return this.userService.findAll(page, limit, role);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to access user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to access user from different organization');
      }
    }
    
    return this.userService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // If org admin, force organization_id to their own
    if (req.user.role === UserRole.ORG_ADMIN) {
      createUserDto.organization_id = req.user.organizationId;
      
      // Org admin can only create org users
      if (createUserDto.role !== UserRole.ORG_USER) {
        throw new Error('Organization admins can only create organization users');
      }
    }
    
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Check if user is org admin and trying to update user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to update user from different organization');
      }
      
      // Org admin can't change organization or promote to admin/org admin
      delete updateUserDto.organization_id;
      if (updateUserDto.role && updateUserDto.role !== UserRole.ORG_USER) {
        throw new Error('Organization admins cannot promote users to admin roles');
      }
    }
    
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to delete user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to delete user from different organization');
      }
    }
    
    return this.userService.remove(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async approveUser(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to approve user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to approve user from different organization');
      }
    }
    
    return this.userService.approveUser(id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async rejectUser(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to reject user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to reject user from different organization');
      }
    }
    
    return this.userService.rejectUser(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async activateUser(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to activate user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to activate user from different organization');
      }
    }
    
    return this.userService.activateUser(id);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async deactivateUser(@Param('id') id: string, @Request() req) {
    // Check if user is org admin and trying to deactivate user from different org
    if (req.user.role === UserRole.ORG_ADMIN) {
      const user = await this.userService.findOne(id);
      if (user.organization_id !== req.user.organizationId) {
        throw new Error('Unauthorized to deactivate user from different organization');
      }
    }
    
    return this.userService.deactivateUser(id);
  }
}
