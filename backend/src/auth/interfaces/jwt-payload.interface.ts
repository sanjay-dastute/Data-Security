import { UserRole } from '../../user-management/entities/user.entity';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  iat?: number;
  exp?: number;
}
