import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    return this.userService.validateUser(username, password);
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      },
    };
  }
}
