import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole, ApprovalStatus } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return this.userService.toResponseDto(user);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.findOne(id);
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  async approveUser(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return this.userService.updateApprovalStatus(id, ApprovalStatus.APPROVED);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  async rejectUser(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return this.userService.updateApprovalStatus(id, ApprovalStatus.REJECTED);
  }
}
