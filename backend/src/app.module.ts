import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';
import { EncryptionModule } from './encryption/encryption.module';
import { DataHandlingModule } from './data-handling/data-handling.module';
import { AdvancedFeaturesModule } from './advanced-features/advanced-features.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { DeploymentModule } from './deployment/deployment.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...typeOrmConfig,
      autoLoadEntities: true,
    }),
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
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppModule.name);

  async onApplicationBootstrap() {
    this.logger.log('Application started successfully');
    this.logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    this.logger.log(`Database: ${typeOrmConfig.type}`);
  }
}
