import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HealthService } from '../../health/health.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(private readonly healthService: HealthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    // Increment total requests counter
    this.healthService.incrementTotalRequests();

    return next.handle().pipe(
      tap({
        next: () => {
          // Request was successful
          this.healthService.incrementSuccessRequests();
          
          // Record request duration
          const duration = Date.now() - startTime;
          this.logMetrics(method, url, duration, true);
        },
        error: (error) => {
          // Request failed
          this.healthService.incrementErrorRequests();
          
          // Record request duration
          const duration = Date.now() - startTime;
          this.logMetrics(method, url, duration, false, error.message);
        },
      }),
    );
  }

  private logMetrics(
    method: string,
    url: string,
    duration: number,
    success: boolean,
    errorMessage?: string,
  ): void {
    if (success) {
      this.logger.debug(
        `[METRICS] ${method} ${url} completed in ${duration}ms`,
      );
    } else {
      this.logger.debug(
        `[METRICS] ${method} ${url} failed in ${duration}ms: ${errorMessage}`,
      );
    }
  }
}
