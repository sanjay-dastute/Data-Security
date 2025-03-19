export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  organizationId?: string;
  iat?: number;
  exp?: number;
}
