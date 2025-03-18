import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole, UserStatus, ApprovalStatus } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Controller('org/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ORG_ADMIN)
export class OrgUsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getOrgUsers(@Req() req: RequestWithUser) {
    return this.userService.findByOrganization(req.user.organizationId);
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = await this.userService.findById(id);
    
    // Check if user belongs to the organization
    if (user.organizationId !== req.user.organizationId) {
      throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
    }
    
    return user;
  }

  @Post()
  async createUser(@Body() createUserDto: any, @Req() req: RequestWithUser) {
    try {
      // Ensure user is created in the same organization
      createUserDto.organizationId = req.user.organizationId;
      
      // Org admin can only create ORG_USER
      createUserDto.role = UserRole.ORG_USER;
      
      return await this.userService.create(createUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Req() req: RequestWithUser,
  ) {
    try {
      const user = await this.userService.findById(id);
      
      // Check if user belongs to the organization
      if (user.organizationId !== req.user.organizationId) {
        throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
      }
      
      // Prevent changing organization or role
      delete updateUserDto.organizationId;
      delete updateUserDto.role;
      
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const user = await this.userService.findById(id);
      
      // Check if user belongs to the organization
      if (user.organizationId !== req.user.organizationId) {
        throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
      }
      
      await this.userService.remove(id);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/approve')
  async approveUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const user = await this.userService.findById(id);
      
      // Check if user belongs to the organization
      if (user.organizationId !== req.user.organizationId) {
        throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
      }
      
      return await this.userService.updateApprovalStatus(id, ApprovalStatus.APPROVED);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/reject')
  async rejectUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const user = await this.userService.findById(id);
      
      // Check if user belongs to the organization
      if (user.organizationId !== req.user.organizationId) {
        throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
      }
      
      return await this.userService.updateApprovalStatus(id, ApprovalStatus.REJECTED);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/activate')
  async activateUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const user = await this.userService.findById(id);
      
      // Check if user belongs to the organization
      if (user.organizationId !== req.user.organizationId) {
        throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
      }
      
      return await this.userService.update(id, { status: UserStatus.ACTIVE });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/deactivate')
  async deactivateUser(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const user = await this.userService.findById(id);
      
      // Check if user belongs to the organization
      if (user.organizationId !== req.user.organizationId) {
        throw new HttpException('User not found in your organization', HttpStatus.NOT_FOUND);
      }
      
      return await this.userService.update(id, { status: UserStatus.INACTIVE });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
