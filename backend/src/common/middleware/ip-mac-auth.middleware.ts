import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class IpMacAuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token
      const payload = this.jwtService.verify(token);
      if (!payload || !payload.sub) {
        return next();
      }

      // Get user
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        return next();
      }

      // Get client IP and MAC
      const clientIp = req.ip || req.headers['x-forwarded-for'] as string || '';
      const clientMac = req.headers['x-client-mac'] as string || '';

      // Parse approved_addresses from JSON string
      const approvedAddresses = user.approved_addresses 
        ? JSON.parse(user.approved_addresses as string) 
        : [];

      // Check if IP and MAC are approved
      const isIpApproved = !clientIp || approvedAddresses.some(addr => addr.ip === clientIp);
      const isMacApproved = !clientMac || approvedAddresses.some(addr => addr.mac === clientMac);

      if (!isIpApproved || !clientMac && !isMacApproved) {
        // Store unapproved address info for breach detection
        req['unapprovedAddress'] = {
          userId: user.id,
          ip: clientIp,
          mac: clientMac,
        };
        
        throw new UnauthorizedException('Access from this device is not authorized');
      }

      // Update last used timestamp for the address
      if (clientIp && clientMac) {
        const addressIndex = approvedAddresses.findIndex(
          addr => addr.ip === clientIp && addr.mac === clientMac
        );
        
        if (addressIndex !== -1) {
          approvedAddresses[addressIndex].last_used = new Date();
          user.approved_addresses = JSON.stringify(approvedAddresses);
          await this.usersRepository.save(user);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
