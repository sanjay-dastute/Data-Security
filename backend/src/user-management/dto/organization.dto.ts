import { IsString, IsUUID, IsOptional, IsObject, IsEmail } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  admin_user_id?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  api_key?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  admin_user_id?: string;

  @IsOptional()
  @IsString()
  api_key?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}

export class OrganizationResponseDto {
  id?: string; // Add this property
  organization_id: string;
  name: string;
  admin_user_id?: string;
  email?: string;
  phone?: string;
  api_key?: string;
  settings: Record<string, any>;
  profile?: Record<string, any>; // Make profile optional since it doesn't exist in entity
  created_at: Date;
  updated_at: Date;
}
