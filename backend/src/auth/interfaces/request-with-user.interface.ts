import { Request } from 'express';
import { User } from '../../user-management/entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    id?: string;
    userId?: string;
    user_id?: string;
    email?: string;
    username?: string;
    role?: string;
    organizationId?: string;
    organization_id?: string;
  };
}
