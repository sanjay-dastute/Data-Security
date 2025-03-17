import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyRecoveryController } from './key-recovery.controller';
import { KeyRecoveryService } from './key-recovery.service';
import { ShamirService } from './shamir.service';
import { Key } from '../../encryption/entities/key.entity';
import { KeyShard } from './entities/key-shard.entity';
import { ShardApproval } from './entities/shard-approval.entity';
import { UserManagementModule } from '../../user-management/user-management.module';
import { AuthModule } from '../../auth/auth.module';
import { EncryptionModule } from '../../encryption/encryption.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Key, KeyShard, ShardApproval]),
    UserManagementModule,
    AuthModule,
    EncryptionModule,
  ],
  controllers: [KeyRecoveryController],
  providers: [KeyRecoveryService, ShamirService],
  exports: [KeyRecoveryService, ShamirService],
})
export class KeyRecoveryModule {}
