import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../user-management/entities/organization.entity';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Get API keys from headers
      const apiKey = req.headers['x-api-key'] as string;
      const orgApiKey = req.headers['x-org-api-key'] as string;
      
      // Skip validation for non-API routes or if no keys are required
      if (!this.isApiRoute(req.path) || this.isPublicRoute(req.path)) {
        return next();
      }
      
      // Validate QuantumTrust API key if provided
      if (apiKey) {
        const isValidApiKey = await this.validateQuantumTrustApiKey(apiKey);
        if (!isValidApiKey) {
          throw new UnauthorizedException('Invalid API key');
        }
      }
      
      // Validate Organization API key if provided
      if (orgApiKey) {
        const organization = await this.validateOrganizationApiKey(orgApiKey);
        if (!organization) {
          throw new UnauthorizedException('Invalid organization API key');
        }
        
        // Attach organization to request for later use
        req['organization'] = organization;
      }
      
      // If neither key is provided for API routes, reject the request
      if (!apiKey && !orgApiKey && this.requiresApiKey(req.path)) {
        throw new UnauthorizedException('API key required');
      }
      
      next();
    } catch (error) {
      res.status(401).json({
        statusCode: 401,
        message: error.message || 'Unauthorized',
      });
    }
  }
  
  private isApiRoute(path: string): boolean {
    return path.startsWith('/api/');
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
    ];
    
    return publicRoutes.some(route => path.startsWith(route));
  }
  
  private requiresApiKey(path: string): boolean {
    const apiKeyRequiredRoutes = [
      '/api/encrypt',
      '/api/decrypt',
      '/api/batch',
      '/api/keys',
      '/api/storage',
    ];
    
    return apiKeyRequiredRoutes.some(route => path.startsWith(route));
  }
  
  private async validateQuantumTrustApiKey(apiKey: string): Promise<boolean> {
    try {
      // Get master API key from environment
      const masterApiKey = this.configService.get<string>('MASTER_API_KEY');
      
      if (!masterApiKey) {
        return false;
      }
      
      // Compare API keys (in a real implementation, you would use a more secure method)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(apiKey),
        Buffer.from(masterApiKey),
      );
      
      return isValid;
    } catch (error) {
      return false;
    }
  }
  
  private async validateOrganizationApiKey(orgApiKey: string): Promise<Organization | null> {
    try {
      // Find organization with matching API key
      const organizations = await this.organizationRepository.find();
      
      for (const org of organizations) {
        if (org.settings && org.settings.org_api_key === orgApiKey) {
          return org;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
