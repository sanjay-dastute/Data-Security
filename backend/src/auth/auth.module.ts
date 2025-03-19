import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user-management/entities/user.entity';
import { Organization } from '../user-management/entities/organization.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IpMacService } from './services/ip-mac.service';
import { IpMacController } from './controllers/ip-mac.controller';
import { EmailService } from './services/email.service';
import { EmailVerificationService } from './services/email-verification.service';
import { EmailVerificationController } from './controllers/email-verification.controller';
import { UserManagementModule } from '../user-management/user-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, VerificationToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'quantum-trust-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '1d'),
        },
      }),
    }),
    UserManagementModule, // Import UserManagementModule to access UserService
  ],
  controllers: [AuthController, IpMacController, EmailVerificationController],
  providers: [
    AuthService, 
    JwtStrategy, 
    IpMacService, 
    EmailService, 
    EmailVerificationService
  ],
  exports: [JwtModule, AuthService, IpMacService, EmailService, EmailVerificationService],
})
export class AuthModule {}
