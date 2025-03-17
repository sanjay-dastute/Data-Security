import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyMfaDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class SetupMfaResponseDto {
  secret: string;
  qrCode: string;
}
