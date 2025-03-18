import { IsString, IsOptional, IsDate, IsObject } from 'class-validator';

export class CreateKeyDto {
  @IsString()
  name: string;

  @IsDate()
  @IsOptional()
  expiration_time?: Date;

  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class KeyResponseDto {
  id: string;
  name: string;
  status: string;
  expiration_time?: Date;
  created_at: Date;
  updated_at: Date;
  userId?: string;
  organizationId?: string;
  metadata?: any;
}
