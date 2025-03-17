import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class RequestShardApprovalDto {
  @IsString()
  @IsNotEmpty()
  requestReason: string;
}

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ShardDto {
  @IsUUID()
  id: string;

  @IsUUID()
  key_id: string;

  @IsString()
  @IsNotEmpty()
  holder_name: string;

  @IsString()
  @IsNotEmpty()
  holder_email: string;

  @IsString()
  @IsNotEmpty()
  encrypted_shard: string;

  @IsNumber()
  @Min(1)
  index: number;
}

export class KeyRecoveryDto {
  @IsUUID()
  key_id: string;

  @IsNumber()
  @Min(2)
  @Max(10)
  threshold: number;

  shards: ShardDto[];
}

export class ShardApprovalDto {
  @IsUUID()
  id: string;

  @IsUUID()
  shard_id: string;

  @IsUUID()
  approver_id: string;

  @IsString()
  @IsNotEmpty()
  approver_name: string;

  @IsString()
  @IsNotEmpty()
  status: 'pending' | 'approved' | 'rejected';
}
