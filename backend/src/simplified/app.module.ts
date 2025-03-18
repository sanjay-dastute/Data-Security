import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { HealthModule } from './health.module';
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
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
