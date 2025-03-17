import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    // In production, use actual SMTP settings
    // For development, use a test account or mock
    this.setupTransporter();
  }

  private async setupTransporter() {
    // For development, use ethereal.email test account
    if (this.configService.get('NODE_ENV') !== 'production') {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } else {
      // For production, use actual SMTP settings
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get('SMTP_PORT'),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    try {
      const info = await this.transporter.sendMail({
        from: `"QuantumTrust Security" <${this.configService.get('SMTP_FROM') || 'noreply@quantumtrust.com'}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to QuantumTrust Data Security</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
            </div>
            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;">
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} QuantumTrust Data Security. All rights reserved.</p>
          </div>
        `,
      });
      
      console.log('Email sent: %s', info.messageId);
      
      // For development, log the test URL
      if (this.configService.get('NODE_ENV') !== 'production') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    try {
      const info = await this.transporter.sendMail({
        from: `"QuantumTrust Security" <${this.configService.get('SMTP_FROM') || 'noreply@quantumtrust.com'}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;">
            <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} QuantumTrust Data Security. All rights reserved.</p>
          </div>
        `,
      });
      
      console.log('Email sent: %s', info.messageId);
      
      // For development, log the test URL
      if (this.configService.get('NODE_ENV') !== 'production') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
