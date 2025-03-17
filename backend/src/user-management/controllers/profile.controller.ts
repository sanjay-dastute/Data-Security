import { Controller, Get, Put, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import * as bcrypt from 'bcrypt';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getProfile(@Request() req) {
    return this.userService.findOne(req.user.userId);
  }

  @Put()
  async updateProfile(@Request() req, @Body() updateData: any) {
    // Remove sensitive fields that shouldn't be updated directly
    const { password, password_hash, role, approvalStatus, isActivated, ...safeUpdateData } = updateData;
    
    return this.userService.update(req.user.userId, safeUpdateData);
  }

  @Put('password')
  async updatePassword(
    @Request() req,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.userService.findOne(req.user.userId);
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.password_hash,
    );
    
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    // Validate new password strength
    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (
      passwordData.newPassword.length < 8 ||
      !passwordRegex.test(passwordData.newPassword)
    ) {
      throw new BadRequestException(
        'Password must be at least 8 characters and include uppercase, lowercase, and numbers or special characters',
      );
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(passwordData.newPassword, 10);
    
    // Update password
    await this.userService.update(req.user.userId, { password_hash: passwordHash });
    
    return { message: 'Password updated successfully' };
  }

  @Get('approved-addresses')
  async getApprovedAddresses(@Request() req) {
    const user = await this.userService.findOne(req.user.userId);
    return { approved_addresses: user.approved_addresses || [] };
  }
}
