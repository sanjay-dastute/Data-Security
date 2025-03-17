import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SelfDestructService } from './self-destruct.service';
import { SelfDestructController } from './self-destruct.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SelfDestructController],
  providers: [SelfDestructService],
  exports: [SelfDestructService],
})
export class SelfDestructModule {}
