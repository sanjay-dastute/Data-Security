import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    return this.userService.toResponseDto(user);
  }

  @Put()
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(req.user.id, updateUserDto);
  }
}
