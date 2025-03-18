import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole, ApprovalStatus } from '../entities/user.entity';

@Controller('org-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrgUsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ORG_ADMIN)
  async findAllInOrganization(@Request() req) {
    return this.userService.findAllByOrganization(req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ORG_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Check if user belongs to the same organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('User does not belong to your organization');
    }
    
    return this.userService.toResponseDto(user);
  }

  @Post()
  @Roles(UserRole.ORG_ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Ensure the user is created in the same organization
    createUserDto.organizationId = req.user.organizationId;
    
    // Org admins can only create org users
    createUserDto.role = UserRole.ORG_USER;
    
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ORG_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.userService.findOne(id);
    
    // Check if user belongs to the same organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('User does not belong to your organization');
    }
    
    // Org admins cannot change the role or organization
    delete updateUserDto.role;
    delete updateUserDto.organizationId;
    
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ORG_ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Check if user belongs to the same organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('User does not belong to your organization');
    }
    
    return this.userService.remove(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ORG_ADMIN)
  async approveUser(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Check if user belongs to the same organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('User does not belong to your organization');
    }
    
    return this.userService.updateApprovalStatus(id, ApprovalStatus.APPROVED);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ORG_ADMIN)
  async deactivateUser(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);
    
    // Check if user belongs to the same organization
    if (user.organizationId !== req.user.organizationId) {
      throw new Error('User does not belong to your organization');
    }
    
    return this.userService.update(id, { isActivated: false });
  }
}
