import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { HealthController } from './controllers/health.controller';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'quantumtrust.sqlite',
      entities: [User, Organization],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Organization]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'quantum_trust_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, HealthController],
  providers: [AuthService],
})
export class AppModule {}
