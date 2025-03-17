import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsDateString } from 'class-validator';

export enum KeyType {
  ENCRYPTION = 'encryption',
  SIGNATURE = 'signature',
}

export class CreateKeyDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsEnum(KeyType)
  key_type: KeyType;

  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsNumber()
  timer_interval?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: Date;
}

export class UpdateKeyDto {
  @IsOptional()
  @IsEnum(KeyType)
  key_type?: KeyType;

  @IsOptional()
  @IsNumber()
  timer_interval?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: Date;
}

export class KeyResponseDto {
  key_id: string;
  user_id: string;
  organization_id?: string;
  key_type: KeyType;
  created_at: Date;
  expires_at?: Date;
  version: number;
  last_used?: Date;
  timer_interval?: number;
  has_shards: boolean;
}

export class KeyRecoveryRequestDto {
  @IsNotEmpty()
  @IsUUID()
  key_id: string;

  @IsNotEmpty()
  @IsString()
  mfa_code: string;
}

export class KeyShardDto {
  @IsNotEmpty()
  @IsUUID()
  key_id: string;

  @IsNotEmpty()
  @IsString()
  shard_id: string;

  @IsNotEmpty()
  @IsString()
  shard_data: string;
}

export class KeyRotationDto {
  @IsNotEmpty()
  @IsUUID()
  key_id: string;

  @IsOptional()
  @IsNumber()
  new_timer_interval?: number;
}
