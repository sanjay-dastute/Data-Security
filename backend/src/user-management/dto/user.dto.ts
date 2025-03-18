import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole, ApprovalStatus } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsEnum(ApprovalStatus)
  @IsOptional()
  approvalStatus?: ApprovalStatus;

  @IsBoolean()
  @IsOptional()
  isActivated?: boolean;

  @IsBoolean()
  @IsOptional()
  mfa_enabled?: boolean;

  @IsString()
  @IsOptional()
  mfa_secret?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsEnum(ApprovalStatus)
  @IsOptional()
  approvalStatus?: ApprovalStatus;

  @IsBoolean()
  @IsOptional()
  isActivated?: boolean;

  @IsBoolean()
  @IsOptional()
  mfa_enabled?: boolean;

  @IsString()
  @IsOptional()
  mfa_secret?: string;
}

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  approvalStatus: ApprovalStatus;
  isActivated: boolean;
  mfa_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}
