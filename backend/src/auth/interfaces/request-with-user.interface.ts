import { Request } from 'express';
import { User } from '../../user-management/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
