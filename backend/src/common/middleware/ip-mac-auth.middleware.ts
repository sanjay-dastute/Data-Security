import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';
import * as requestIp from 'request-ip';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpMacAuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Skip validation for public routes
      if (this.isPublicRoute(req.path)) {
        return next();
      }
      
      // Get client IP
      const clientIp = requestIp.getClientIp(req);
      
      // Get MAC address from header (in a real implementation, this would be more secure)
      // Note: In a browser environment, getting MAC address is not possible directly
      // This is a simplified implementation for demonstration purposes
      const clientMac = req.headers['x-client-mac'] as string;
      
      // Get user ID from JWT token
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        return next();
      }
      
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        
        const userId = payload.sub;
        
        // Find user
        const user = await this.userRepository.findOne({ where: { id: userId } as any });
        if (!user) {
          return next();
        }
        
        // Check if IP and MAC are approved
        const approvedAddresses = user.approved_addresses || [];
        const isIpApproved = !clientIp || approvedAddresses.some(addr => addr.ip === clientIp);
        const isMacApproved = !clientMac || approvedAddresses.some(addr => addr.mac === clientMac);
        
        // If IP or MAC is not approved, reject the request
        if (!isIpApproved || !isMacApproved) {
          // Store the unapproved address in the request for logging
          req['unapprovedAddress'] = {
            ip: clientIp,
            mac: clientMac,
            userId: userId,
          };
          
          throw new ForbiddenException('Access from this device is not approved');
        }
        
        // Attach client address to request for logging
        req['clientAddress'] = {
          ip: clientIp,
          mac: clientMac,
        };
        
        next();
      } catch (error) {
        // If token verification fails, continue without IP/MAC validation
        if (error.name === 'JsonWebTokenError') {
          return next();
        }
        
        throw error;
      }
    } catch (error) {
      // If this is an unapproved address, we'll handle it in the controller
      if (req['unapprovedAddress']) {
        req['unapprovedAddressError'] = error.message;
        return next();
      }
      
      res.status(403).json({
        statusCode: 403,
        message: error.message || 'Forbidden',
      });
    }
  }
  
  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify-email',
      '/api/auth/resend-verification',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api-docs',
      '/api/detect-breach',
    ];
    
    return publicRoutes.some(route => path.startsWith(route));
  }
  
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
