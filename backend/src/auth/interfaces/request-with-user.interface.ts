import { Request } from 'express';
import { User } from '../../user-management/entities/user.entity';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    email: string;
    role: string;
    organizationId?: string;
  };
  clientAddress?: {
    ip: string;
    mac: string;
  };
  unapprovedAddress?: {
    ip: string;
    mac: string;
    userId: string;
  };
}
