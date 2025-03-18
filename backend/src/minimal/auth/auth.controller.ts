import { Controller, Post, Body, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.userService.create(registerDto);
  }

  @Get('health')
  async health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
