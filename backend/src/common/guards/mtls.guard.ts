import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as tls from 'tls';

@Injectable()
export class MtlsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if mTLS is required for this route
    const requireMtls = this.reflector.get<boolean>('require-mtls', context.getHandler());
    
    // If mTLS is not required, allow access
    if (!requireMtls) {
      return true;
    }
    
    // Get request from context
    const request = context.switchToHttp().getRequest();
    
    // Check if client certificate is present
    const clientCert = request.connection.getPeerCertificate();
    
    if (!clientCert || Object.keys(clientCert).length === 0) {
      throw new UnauthorizedException('Client certificate required');
    }
    
    // Verify client certificate
    try {
      const isValid = this.verifyClientCertificate(clientCert);
      
      if (!isValid) {
        throw new UnauthorizedException('Invalid client certificate');
      }
      
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Certificate validation failed: ${error.message}`);
    }
  }
  
  private verifyClientCertificate(clientCert: any): boolean {
    try {
      // Get CA certificate path from config
      const caCertPath = this.configService.get<string>('CA_CERT_PATH') || 
        path.resolve(__dirname, '../../../ssl/ca-certificate.pem');
      
      // Check if CA certificate exists
      if (!fs.existsSync(caCertPath)) {
        throw new Error('CA certificate not found');
      }
      
      // Read CA certificate
      const caCert = fs.readFileSync(caCertPath);
      
      // Verify client certificate against CA certificate
      const secureContext = tls.createSecureContext({
        ca: caCert,
      });
      
      // In a real implementation, you would perform more thorough validation
      // This is a simplified example
      
      // Check if certificate is expired
      const now = Date.now();
      const validFrom = new Date(clientCert.valid_from).getTime();
      const validTo = new Date(clientCert.valid_to).getTime();
      
      if (now < validFrom || now > validTo) {
        throw new Error('Certificate is expired or not yet valid');
      }
      
      // Check if certificate is revoked
      // In a real implementation, you would check against a CRL or OCSP
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}
