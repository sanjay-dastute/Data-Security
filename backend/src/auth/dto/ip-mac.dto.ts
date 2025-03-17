import { IsString, IsOptional } from 'class-validator';

export class IpMacDto {
  @IsString()
  ip: string;

  @IsString()
  mac: string;
}

export class ApproveAddressDto {
  @IsString()
  userId: string;

  @IsString()
  ip: string;

  @IsString()
  mac: string;

  @IsOptional()
  @IsString()
  description?: string;
}
