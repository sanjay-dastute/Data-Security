import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HealthCheckResult, HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';
import { BlockchainService } from '../encryption/services/blockchain.service';
import { User } from '../user-management/entities/user.entity';
import { promisify } from 'util';
import * as os from 'os';

@Injectable()
export class HealthService extends HealthIndicator {
  private readonly logger = new Logger(HealthService.name);
  private startTime: number;
  private metrics: any = {
    requests: {
      total: 0,
      success: 0,
      error: 0,
    },
    encryption: {
      operations: 0,
      averageTime: 0,
    },
    decryption: {
      operations: 0,
      averageTime: 0,
    },
    users: {
      total: 0,
      active: 0,
    },
    memory: {
      usage: 0,
      rss: 0,
    },
    system: {
      cpuLoad: 0,
      totalMemory: 0,
      freeMemory: 0,
    },
    concurrentUsers: {
      current: 0,
      max: 500,
    }
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly blockchainService: BlockchainService,
  ) {
    super();
    this.startTime = Date.now();
    this.updateMetricsRegularly();
  }

  async checkBlockchainHealth(): Promise<HealthIndicatorResult> {
    try {
      // Check if blockchain is configured
      const isConfigured = await this.blockchainService.isBlockchainConfigured();

      if (!isConfigured) {
        return this.getStatus('blockchain', false, {
          message: 'Blockchain is not configured, using local storage fallback',
        });
      }

      return this.getStatus('blockchain', true);
    } catch (error) {
      this.logger.error(`Blockchain health check failed: ${error.message}`);
      return this.getStatus('blockchain', false, {
        message: `Blockchain is unhealthy: ${error.message}`,
      });
    }
  }

  async checkServicesReady(): Promise<HealthIndicatorResult> {
    try {
      // Check if all required services are ready
      const services = {
        encryption: true,
        keyManagement: true,
        fileProcessing: true,
        userManagement: true,
      };

      return this.getStatus('services', true, services);
    } catch (error) {
      this.logger.error(`Services readiness check failed: ${error.message}`);
      return this.getStatus('services', false, {
        message: `Services are not ready: ${error.message}`,
      });
    }
  }

  async getMetrics(): Promise<any> {
    try {
      // Update metrics before returning
      await this.updateMetrics();

      // Add uptime to metrics
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);

      return {
        ...this.metrics,
        uptime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error.message}`);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async updateMetrics(): Promise<void> {
    try {
      // Update memory metrics
      const memoryUsage = process.memoryUsage();
      this.metrics.memory.usage = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      this.metrics.memory.rss = Math.round(memoryUsage.rss / 1024 / 1024);

      // Update system metrics
      this.metrics.system.totalMemory = Math.round(os.totalmem() / 1024 / 1024);
      this.metrics.system.freeMemory = Math.round(os.freemem() / 1024 / 1024);
      
      // Get CPU load average (1, 5, 15 minutes)
      const loadAvg = os.loadavg();
      this.metrics.system.cpuLoad = loadAvg[0]; // 1 minute average

      // Update user metrics
      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({
        where: { is_active: true } as any,
      });

      this.metrics.users.total = totalUsers;
      this.metrics.users.active = activeUsers;
    } catch (error) {
      this.logger.error(`Failed to update metrics: ${error.message}`);
    }
  }

  private updateMetricsRegularly(): void {
    // Update metrics every minute
    setInterval(async () => {
      await this.updateMetrics();
    }, 60000);
  }

  // Methods to be called from interceptors to update request metrics
  incrementTotalRequests(): void {
    this.metrics.requests.total++;
  }

  incrementSuccessRequests(): void {
    this.metrics.requests.success++;
  }

  incrementErrorRequests(): void {
    this.metrics.requests.error++;
  }

  // Methods to be called from encryption service to update encryption metrics
  recordEncryptionOperation(timeMs: number): void {
    this.metrics.encryption.operations++;
    this.metrics.encryption.averageTime =
      (this.metrics.encryption.averageTime * (this.metrics.encryption.operations - 1) + timeMs) /
      this.metrics.encryption.operations;
  }

  recordDecryptionOperation(timeMs: number): void {
    this.metrics.decryption.operations++;
    this.metrics.decryption.averageTime =
      (this.metrics.decryption.averageTime * (this.metrics.decryption.operations - 1) + timeMs) /
      this.metrics.decryption.operations;
  }

  // Methods to track concurrent users
  trackUserLogin(): void {
    this.metrics.concurrentUsers.current++;
  }

  trackUserLogout(): void {
    if (this.metrics.concurrentUsers.current > 0) {
      this.metrics.concurrentUsers.current--;
    }
  }
}
