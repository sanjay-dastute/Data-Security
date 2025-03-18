import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'quantum_trust_secret_key_for_jwt_tokens',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
  exports: [AuthService, UserService],
})
export class AuthModule {}
