import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BlockchainService } from '../../encryption/services/blockchain.service';

@Catch(HttpException)
export class BreachDetectionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BreachDetectionFilter.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    
    // Check if this is an unapproved address error
    if (status === HttpStatus.FORBIDDEN && request['unapprovedAddress']) {
      await this.handlePotentialBreach(request);
    }
    
    // Check for other security-related errors
    if (this.isSecurityRelatedError(exception, status)) {
      await this.logSecurityEvent(request, exception);
    }
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
  
  private async handlePotentialBreach(request: Request): Promise<void> {
    try {
      const { ip, mac, userId } = request['unapprovedAddress'];
      
      this.logger.warn(`Potential breach detected: Unapproved access from IP ${ip}, MAC ${mac} for user ${userId}`);
      
      // Log to blockchain
      await this.blockchainService.logEvent({
        user_id: userId,
        event_type: 'security_breach',
        timestamp: new Date(),
        metadata: {
          ip,
          mac,
          url: request.url,
          method: request.method,
          breach_type: 'unapproved_address',
          user_agent: request.headers['user-agent'],
        },
      });
      
      // In a real implementation, you would also:
      // 1. Send alerts to administrators
      // 2. Trigger additional security measures
      // 3. Potentially block the IP address
    } catch (error) {
      this.logger.error(`Failed to handle potential breach: ${error.message}`);
    }
  }
  
  private isSecurityRelatedError(exception: HttpException, status: number): boolean {
    // Check for security-related HTTP status codes
    if ([HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN].includes(status)) {
      return true;
    }
    
    // Check for security-related error messages
    const errorMessage = exception.message.toLowerCase();
    const securityKeywords = [
      'unauthorized', 'forbidden', 'invalid token', 'expired token',
      'invalid signature', 'invalid api key', 'csrf', 'xss', 'injection',
      'security', 'breach', 'attack', 'hack', 'exploit',
    ];
    
    return securityKeywords.some(keyword => errorMessage.includes(keyword));
  }
  
  private async logSecurityEvent(request: Request, exception: HttpException): Promise<void> {
    try {
      const userId = request.user?.user_id || 'anonymous';
      const clientIp = request.ip;
      const clientMac = request.headers['x-client-mac'] || 'unknown';
      
      this.logger.warn(`Security event detected: ${exception.message} - User: ${userId}, IP: ${clientIp}, MAC: ${clientMac}`);
      
      // Log to blockchain
      await this.blockchainService.logEvent({
        user_id: userId,
        event_type: 'security_event',
        timestamp: new Date(),
        metadata: {
          ip: clientIp,
          mac: clientMac,
          url: request.url,
          method: request.method,
          status_code: exception.getStatus(),
          error_message: exception.message,
          user_agent: request.headers['user-agent'],
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`);
    }
  }
}
