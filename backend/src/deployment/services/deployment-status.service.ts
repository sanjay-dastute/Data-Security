import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { DeploymentStatus, DeploymentStatusDto } from '../dto/deployment-status.dto';

@Injectable()
export class DeploymentStatusService {
  private readonly logger = new Logger(DeploymentStatusService.name);
  private readonly deploymentStatuses: Map<string, DeploymentStatusDto> = new Map();
  private readonly logsDir: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // Create logs directory if it doesn't exist
    this.logsDir = path.join(process.cwd(), 'logs', 'deployments');
    fs.mkdirSync(this.logsDir, { recursive: true });
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<{ items: DeploymentStatusDto[], total: number }> {
    const statuses = Array.from(this.deploymentStatuses.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(offset, offset + limit);

    return {
      items: statuses,
      total: this.deploymentStatuses.size,
    };
  }

  async findOne(jobId: string): Promise<DeploymentStatusDto | null> {
    return this.deploymentStatuses.get(jobId) || null;
  }

  async getLogs(jobId: string): Promise<string | null> {
    try {
      const logPath = path.join(this.logsDir, `${jobId}.log`);
      if (!fs.existsSync(logPath)) {
        return null;
      }
      return fs.readFileSync(logPath, 'utf8');
    } catch (error) {
      this.logger.error(`Failed to read logs for job ${jobId}: ${error.message}`);
      return null;
    }
  }

  async createDeploymentStatus(jobId: string): Promise<DeploymentStatusDto> {
    const status: DeploymentStatusDto = {
      jobId,
      status: DeploymentStatus.PENDING,
      startTime: new Date(),
      message: 'Deployment initiated',
    };

    this.deploymentStatuses.set(jobId, status);
    await this.appendToLogs(jobId, `[${new Date().toISOString()}] Deployment initiated`);

    return status;
  }

  async updateDeploymentStatus(
    jobId: string,
    status: DeploymentStatus,
    message?: string,
  ): Promise<DeploymentStatusDto> {
    const deploymentStatus = this.deploymentStatuses.get(jobId);
    if (!deploymentStatus) {
      throw new NotFoundException(`Deployment status with job ID ${jobId} not found`);
    }

    deploymentStatus.status = status;
    if (message) {
      deploymentStatus.message = message;
    }

    if (status === DeploymentStatus.COMPLETED || status === DeploymentStatus.FAILED) {
      deploymentStatus.endTime = new Date();
      deploymentStatus.success = status === DeploymentStatus.COMPLETED;
    }

    this.deploymentStatuses.set(jobId, deploymentStatus);
    await this.appendToLogs(jobId, `[${new Date().toISOString()}] Status updated to ${status}: ${message || ''}`);

    return deploymentStatus;
  }

  async appendToLogs(jobId: string, message: string): Promise<void> {
    try {
      const logPath = path.join(this.logsDir, `${jobId}.log`);
      fs.appendFileSync(logPath, `${message}\n`);
    } catch (error) {
      this.logger.error(`Failed to append to logs for job ${jobId}: ${error.message}`);
    }
  }
}
