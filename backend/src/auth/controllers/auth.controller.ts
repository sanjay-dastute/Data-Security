import { Controller, Post, Body, UseGuards, Get, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { VerifyMfaDto } from '../dto/mfa.dto';
import { LoginResponseDto, MfaRequiredResponseDto, RegisterResponseDto, UserDto } from '../dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto | MfaRequiredResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): UserDto {
    return req.user;
  }

  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() verifyMfaDto: VerifyMfaDto): Promise<LoginResponseDto> {
    return this.authService.verifyMfa(verifyMfaDto.userId, verifyMfaDto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('setup-mfa')
  async setupMfa(@Request() req) {
    return this.authService.setupMfa(req.user.userId);
  }
}
