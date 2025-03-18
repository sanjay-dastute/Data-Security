import { IsString, IsEmail, IsEnum, IsUUID, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;

  @IsOptional()
  @IsBoolean()
  mfa_enabled?: boolean;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @IsOptional()
  @IsBoolean()
  isActivated?: boolean;
}

export class UserResponseDto {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  organization_id?: string;
  permissions: Record<string, boolean>;
  mfa_enabled: boolean;
  details: Record<string, any>;
  approved_addresses: Array<{ ip: string; mac: string }>;
  approval_status: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
