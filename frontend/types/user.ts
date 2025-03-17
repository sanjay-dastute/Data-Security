export enum UserRole {
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  ORG_USER = 'org_user'
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  organization_id?: string;
  permissions?: Record<string, boolean>;
  mfa_enabled?: boolean;
  details?: Record<string, any>;
  approved_addresses?: Array<{ ip: string; mac: string }>;
  isActivated?: boolean;
  approvalStatus?: string;
  created_at?: Date;
  updated_at?: Date;
}
