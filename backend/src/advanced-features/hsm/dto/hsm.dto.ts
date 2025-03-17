import { IsBoolean, IsString, IsOptional, IsIn, IsNumber, Min, Max, ValidateIf } from 'class-validator';

export class HsmConfigDto {
  @IsBoolean()
  enabled: boolean;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  @IsIn(['THALES', 'YUBIHSM', 'AWS_CLOUDHSM', 'AZURE_KEY_VAULT', 'GOOGLE_CLOUD_HSM'])
  provider: string;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  ip: string;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  port: string;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  slot: string;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  pin: string;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  @IsOptional()
  label: string;

  @ValidateIf(o => o.enabled === true)
  @IsString()
  libraryPath: string;

  @IsBoolean()
  @IsOptional()
  useForKeyGeneration: boolean;

  @IsBoolean()
  @IsOptional()
  useForEncryption: boolean;

  @IsBoolean()
  @IsOptional()
  useForDecryption: boolean;
}

export class TestHsmConnectionDto extends HsmConfigDto {}

export class HsmKeyGenerationDto {
  @IsString()
  keyLabel: string;

  @IsNumber()
  @Min(1024)
  @Max(4096)
  keySize: number;

  @IsString()
  @IsIn(['RSA', 'EC', 'AES'])
  keyType: string;

  @IsString()
  @IsOptional()
  mechanism: string;
}

export class HsmEncryptionDto {
  @IsString()
  keyId: string;

  @IsString()
  data: string;

  @IsString()
  @IsOptional()
  mechanism: string;
}

export class HsmDecryptionDto {
  @IsString()
  keyId: string;

  @IsString()
  encryptedData: string;

  @IsString()
  @IsOptional()
  mechanism: string;
}
