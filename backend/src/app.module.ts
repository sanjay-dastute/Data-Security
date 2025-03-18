import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';
import { EncryptionModule } from './encryption/encryption.module';
import { DataHandlingModule } from './data-handling/data-handling.module';
import { AdvancedFeaturesModule } from './advanced-features/advanced-features.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { DeploymentModule } from './deployment/deployment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UserManagementModule,
    EncryptionModule,
    DataHandlingModule,
    AdvancedFeaturesModule,
    CommonModule,
    HealthModule,
    DeploymentModule,
  ],
})
export class AppModule {}
