import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';
import { EncryptionModule } from './encryption/encryption.module';
import { DataHandlingModule } from './data-handling/data-handling.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { DeploymentModule } from './deployment/deployment.module';
import { AdvancedFeaturesModule } from './advanced-features/advanced-features.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') === 'development';
        
        if (isDevelopment) {
          // Use SQLite for local development
          return {
            type: 'sqlite',
            database: 'quantumtrust.sqlite',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: true,
          };
        } else {
          // Use PostgreSQL for production
          return {
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: +configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('TYPEORM_SYNCHRONIZE') === 'true',
            logging: isDevelopment,
          };
        }
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'quantum_trust_secret_key',
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRATION') || '1h',
        },
      }),
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    CommonModule,
    AuthModule,
    UserManagementModule,
    EncryptionModule,
    DataHandlingModule,
    HealthModule,
    DeploymentModule,
    AdvancedFeaturesModule,
  ],
})
export class AppModule {}
