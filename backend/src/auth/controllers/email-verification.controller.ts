import { Controller, Post, Body, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmailVerificationService } from '../services/email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Post('resend')
  async resendVerificationEmail(@Body() body: { email: string }) {
    const result = await this.emailVerificationService.resendVerificationEmail(body.email);
    
    if (!result) {
      throw new NotFoundException('User not found or already verified');
    }
    
    return { message: 'Verification email sent successfully' };
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    
    const result = await this.emailVerificationService.verifyEmail(token);
    
    if (!result) {
      throw new BadRequestException('Invalid or expired token');
    }
    
    return { message: 'Email verified successfully' };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { email: string }) {
    const result = await this.emailVerificationService.sendPasswordResetEmail(body.email);
    
    // Always return success to prevent email enumeration
    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    if (!body.token || !body.password) {
      throw new BadRequestException('Token and password are required');
    }
    
    const result = await this.emailVerificationService.resetPassword(body.token, body.password);
    
    if (!result) {
      throw new BadRequestException('Invalid or expired token');
    }
    
    return { message: 'Password reset successfully' };
  }
}
