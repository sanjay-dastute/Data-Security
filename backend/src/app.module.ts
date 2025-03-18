import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';
import { EncryptionModule } from './encryption/encryption.module';
import { DataHandlingModule } from './data-handling/data-handling.module';
import { HealthModule } from './health/health.module';
import { User } from './user-management/entities/user.entity';
import { Organization } from './user-management/entities/organization.entity';
import { VerificationToken } from './auth/entities/verification-token.entity';
import { Key } from './encryption/entities/key.entity';
import { TemporaryMetadata } from './data-handling/entities/temporary-metadata.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'quantumtrust.sqlite',
      entities: [User, Organization, VerificationToken, Key, TemporaryMetadata],
      synchronize: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'quantum_trust_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
    UserManagementModule,
    EncryptionModule,
    DataHandlingModule,
    HealthModule,
  ],
})
export class AppModule {}
