import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { ApiKeyAuthMiddleware } from './middleware/api-key-auth.middleware';
import { IpMacAuthMiddleware } from './middleware/ip-mac-auth.middleware';
import { SanitizeInterceptor } from './interceptors/sanitize.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { BreachDetectionFilter } from './filters/breach-detection.filter';
import { MtlsGuard } from './guards/mtls.guard';

import { Organization } from '../user-management/entities/organization.entity';
import { User } from '../user-management/entities/user.entity';
import { BlockchainService } from '../encryption/services/blockchain.service';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
    EncryptionModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: BreachDetectionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: MtlsGuard,
    },
  ],
  exports: [
    JwtModule,
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyAuthMiddleware)
      .forRoutes('*');
    
    consumer
      .apply(IpMacAuthMiddleware)
      .forRoutes('*');
  }
}
