import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, ApprovalStatus } from '../../user-management/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { EmailVerificationService } from './email-verification.service';
import { IpMacService } from './ip-mac.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
    private ipMacService: IpMacService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new UnauthorizedException('Your account is pending approval');
    }

    if (!user.isActivated) {
      throw new UnauthorizedException('Your account is not activated. Please verify your email.');
    }

    return user;
  }

  async login(loginDto: LoginDto, ip: string, mac: string): Promise<any> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // Check if IP/MAC is approved
    const isAddressApproved = await this.ipMacService.isAddressApproved(user.id, ip, mac);
    if (!isAddressApproved) {
      throw new UnauthorizedException('Access from this device is not authorized');
    }

    // Update last used timestamp
    await this.ipMacService.updateLastUsed(user.id, ip, mac);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        mfa_enabled: user.mfa_enabled,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user
    const newUser = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || UserRole.ORG_USER,
      approvalStatus: ApprovalStatus.PENDING,
      isActivated: false,
      organizationId: registerDto.organizationId,
      approved_addresses: JSON.stringify([{
        ip: registerDto.ip,
        mac: registerDto.mac,
        added: new Date(),
        last_used: null
      }]),
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Send verification email
    await this.emailVerificationService.sendVerificationEmail(savedUser.id);

    return savedUser;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload);
  }
}
