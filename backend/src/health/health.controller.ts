import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
    private readonly healthService: HealthService
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.memoryHealthIndicator.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
      () => this.memoryHealthIndicator.checkRSS('memory_rss', 500 * 1024 * 1024), // 500MB
      () => this.diskHealthIndicator.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
      () => this.healthService.checkBlockchainHealth(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check API readiness' })
  @ApiResponse({ status: 200, description: 'API is ready' })
  @ApiResponse({ status: 503, description: 'API is not ready' })
  async checkReadiness() {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () => this.healthService.checkServicesReady(),
    ]);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get API metrics for Prometheus' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    return this.healthService.getMetrics();
  }
}
