import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';
import { VerificationToken } from '../entities/verification-token.entity';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(VerificationToken)
    private tokensRepository: Repository<VerificationToken>,
    private emailService: EmailService,
  ) {}

  async sendVerificationEmail(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { user_id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if user is already verified
    if (user.isActivated) {
      return false;
    }
    
    // Generate token
    const token = this.emailService.generateVerificationToken();
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Save token to database
    const verificationToken = this.tokensRepository.create({
      user_id: userId,
      token,
      type: 'email_verification',
      expires_at: expiresAt,
      used: false,
    });
    
    await this.tokensRepository.save(verificationToken);
    
    // Send email
    return this.emailService.sendVerificationEmail(user.email, token);
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user || user.isActivated) {
      return false;
    }
    
    return this.sendVerificationEmail(user.user_id);
  }

  async verifyEmail(token: string): Promise<boolean> {
    const verificationToken = await this.tokensRepository.findOne({
      where: {
        token,
        type: 'email_verification',
        used: false,
      },
    });
    
    if (!verificationToken) {
      return false;
    }
    
    // Check if token is expired
    if (new Date() > verificationToken.expires_at) {
      return false;
    }
    
    // Get user
    const user = await this.usersRepository.findOne({
      where: { user_id: verificationToken.user_id },
    });
    
    if (!user) {
      return false;
    }
    
    // Mark user as verified
    user.isActivated = true;
    await this.usersRepository.save(user);
    
    // Mark token as used
    verificationToken.used = true;
    await this.tokensRepository.save(verificationToken);
    
    return true;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      // Return true to prevent email enumeration
      return true;
    }
    
    // Generate token
    const token = this.emailService.generateVerificationToken();
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Save token to database
    const resetToken = this.tokensRepository.create({
      user_id: user.user_id,
      token,
      type: 'password_reset',
      expires_at: expiresAt,
      used: false,
    });
    
    await this.tokensRepository.save(resetToken);
    
    // Send email
    return this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.tokensRepository.findOne({
      where: {
        token,
        type: 'password_reset',
        used: false,
      },
    });
    
    if (!resetToken) {
      return false;
    }
    
    // Check if token is expired
    if (new Date() > resetToken.expires_at) {
      return false;
    }
    
    // Get user
    const user = await this.usersRepository.findOne({
      where: { user_id: resetToken.user_id },
    });
    
    if (!user) {
      return false;
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    user.password_hash = passwordHash;
    await this.usersRepository.save(user);
    
    // Mark token as used
    resetToken.used = true;
    await this.tokensRepository.save(resetToken);
    
    return true;
  }
}
