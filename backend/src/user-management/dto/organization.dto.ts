import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  admin_user_id?: string;

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
  @IsObject()
  settings?: Record<string, any>;

  @IsOptional()
  @IsObject()
  profile?: Record<string, any>;
}

export class OrganizationResponseDto {
  organization_id: string;
  name: string;
  admin_user_id?: string;
  settings: Record<string, any>;
  profile?: Record<string, any>; // Make profile optional since it doesn't exist in entity
  created_at: Date;
  updated_at: Date;
}
