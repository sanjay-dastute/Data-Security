import { IsString, IsEmail, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  settings?: any;

  @IsString()
  @IsOptional()
  api_key?: string;
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  settings?: any;

  @IsString()
  @IsOptional()
  api_key?: string;
}

export class OrganizationResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  settings: any;
  api_key?: string;
  created_at: Date;
  updated_at: Date;
}
