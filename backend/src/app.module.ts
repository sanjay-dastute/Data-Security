import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

// Entity imports
import { User } from './user-management/entities/user.entity';
import { Organization } from './user-management/entities/organization.entity';
import { VerificationToken } from './auth/entities/verification-token.entity';
import { Key } from './encryption/entities/key.entity';
import { TemporaryMetadata } from './data-handling/entities/temporary-metadata.entity';
import { KeyShard } from './advanced-features/key-recovery/entities/key-shard.entity';
import { ShardApproval } from './advanced-features/key-recovery/entities/shard-approval.entity';
import { BatchProcess } from './advanced-features/batch-processing/entities/batch-process.entity';
import { DeploymentConfig } from './deployment/entities/deployment-config.entity';

// Module imports
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';
import { EncryptionModule } from './encryption/encryption.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataHandlingModule } from './data-handling/data-handling.module';
import { AdvancedFeaturesModule } from './advanced-features/advanced-features.module';
import { DeploymentModule } from './deployment/deployment.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432'), 10),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'quantumtrust'),
        entities: [
          User,
          Organization,
          VerificationToken,
          Key,
          TemporaryMetadata,
          KeyShard,
          ShardApproval,
          BatchProcess,
          DeploymentConfig
        ],
        synchronize: configService.get('TYPEORM_SYNCHRONIZE', 'true') === 'true',
        logging: configService.get('NODE_ENV', 'development') !== 'production',
        ssl: configService.get('DB_SSL', 'false') === 'true' ? {
          rejectUnauthorized: false
        } : false,
      }),
    }),
    
    // GraphQL - temporarily disabled for testing
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   sortSchema: true,
    //   playground: process.env.NODE_ENV !== 'production',
    // }),
    
    // Core modules
    CommonModule,
    HealthModule,
    
    // Feature modules
    AuthModule,
    UserManagementModule,
    EncryptionModule,
    DashboardsModule,
    DataHandlingModule,
    AdvancedFeaturesModule,
    DeploymentModule,
  ],
})
export class AppModule {}
