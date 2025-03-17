import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BlockchainService } from '../../encryption/services/blockchain.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const userId = request.user?.userId || 'anonymous';
    const clientAddress = request['clientAddress'] || { ip: ip, mac: 'unknown' };
    
    const now = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - now;
          
          // Log to console
          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms - User: ${userId} - IP: ${clientAddress.ip} - MAC: ${clientAddress.mac}`,
          );
          
          // Log to blockchain for sensitive operations
          if (this.isSensitiveOperation(method, url)) {
            this.logToBlockchain(userId, method, url, statusCode, clientAddress, responseTime);
          }
        },
        error: (error) => {
          const statusCode = error.status || 500;
          const responseTime = Date.now() - now;
          
          // Log error to console
          this.logger.error(
            `${method} ${url} ${statusCode} ${responseTime}ms - User: ${userId} - IP: ${clientAddress.ip} - MAC: ${clientAddress.mac} - Error: ${error.message}`,
          );
          
          // Log error to blockchain for sensitive operations
          if (this.isSensitiveOperation(method, url)) {
            this.logToBlockchain(userId, method, url, statusCode, clientAddress, responseTime, error.message);
          }
        },
      }),
    );
  }
  
  private isSensitiveOperation(method: string, url: string): boolean {
    const sensitiveOperations = [
      { method: 'POST', urlPattern: /^\/api\/encrypt/ },
      { method: 'POST', urlPattern: /^\/api\/decrypt/ },
      { method: 'POST', urlPattern: /^\/api\/keys/ },
      { method: 'PUT', urlPattern: /^\/api\/keys/ },
      { method: 'DELETE', urlPattern: /^\/api\/keys/ },
      { method: 'POST', urlPattern: /^\/api\/batch/ },
      { method: 'POST', urlPattern: /^\/api\/key-recovery/ },
      { method: 'POST', urlPattern: /^\/api\/detect-breach/ },
    ];
    
    return sensitiveOperations.some(op => 
      op.method === method && op.urlPattern.test(url)
    );
  }
  
  private async logToBlockchain(
    userId: string,
    method: string,
    url: string,
    statusCode: number,
    clientAddress: { ip: string; mac: string },
    responseTime: number,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.blockchainService.logEvent({
        user_id: userId,
        event_type: 'api_access',
        timestamp: new Date(),
        metadata: {
          method,
          url,
          status_code: statusCode,
          ip: clientAddress.ip,
          mac: clientAddress.mac,
          response_time: responseTime,
          error: errorMessage,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log to blockchain: ${error.message}`);
    }
  }
}
