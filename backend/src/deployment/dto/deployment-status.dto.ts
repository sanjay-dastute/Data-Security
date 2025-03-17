import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDate, IsBoolean } from 'class-validator';

export enum DeploymentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class DeploymentStatusDto {
  @ApiProperty({ description: 'Deployment job ID' })
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ enum: DeploymentStatus, description: 'Deployment status' })
  @IsEnum(DeploymentStatus)
  status: DeploymentStatus;

  @ApiProperty({ description: 'Deployment message', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Deployment start time' })
  @IsDate()
  startTime: Date;

  @ApiProperty({ description: 'Deployment end time', required: false })
  @IsDate()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({ description: 'Whether the deployment was successful', required: false })
  @IsBoolean()
  @IsOptional()
  success?: boolean;

  @ApiProperty({ description: 'Deployment logs', required: false })
  @IsString()
  @IsOptional()
  logs?: string;
}
