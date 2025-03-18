import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../user-management/entities/organization.entity';
import { User, UserRole } from '../../user-management/entities/user.entity';

@Injectable()
export class ApiKeyAuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if API key is provided
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return next();
      }

      // Check if organization ID is provided
      const orgId = req.headers['x-organization-id'] as string;
      if (!orgId) {
        throw new UnauthorizedException('Organization ID is required');
      }

      // Get organization
      const org = await this.organizationsRepository.findOne({ where: { id: orgId } });
      if (!org) {
        throw new UnauthorizedException('Organization not found');
      }

      // Parse settings from JSON string
      const settings = org.settings ? JSON.parse(org.settings) : {};

      // Check if API key matches
      if (settings && settings.org_api_key === apiKey) {
        // Find an admin user for this organization to use as the authenticated user
        const orgAdmin = await this.usersRepository.findOne({
          where: {
            organizationId: org.id,
            role: UserRole.ORG_ADMIN,
          },
        });

        if (!orgAdmin) {
          throw new UnauthorizedException('No organization admin found');
        }

        // Set user in request
        req['user'] = orgAdmin;
        return next();
      }

      throw new UnauthorizedException('Invalid API key');
    } catch (error) {
      next(error);
    }
  }
}
