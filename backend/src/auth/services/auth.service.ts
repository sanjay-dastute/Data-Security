import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User, UserRole, ApprovalStatus } from '../../user-management/entities/user.entity';
import { Organization } from '../../user-management/entities/organization.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { LoginResponseDto, MfaRequiredResponseDto, RegisterResponseDto } from '../dto/auth-response.dto';
import { SetupMfaResponseDto } from '../dto/mfa.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ 
      where: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    if (user.approval_status !== 'approved' || !user.is_active) {
      throw new UnauthorizedException('Your account is pending approval or not activated');
    }
    
    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto | MfaRequiredResponseDto> {
    const { username, password, mfaCode, ipAddress, macAddress } = loginDto;
    
    const user = await this.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if IP/MAC is approved
    if (ipAddress && macAddress) {
      const isApproved = this.isAddressApproved(user, ipAddress, macAddress);
      if (!isApproved) {
        throw new UnauthorizedException('Access from this device is not approved');
      }
    }
    
    // Check if MFA is required
    if (user.mfa_enabled) {
      if (!mfaCode) {
        return {
          requiresMfa: true,
          userId: user.id,
          message: 'MFA code required',
        };
      }
      
      const isValidMfa = await this.verifyMfaCode(user.id, mfaCode);
      if (!isValidMfa) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }
    
    // Update last login
    user.last_login = new Date();
    await this.usersRepository.save(user);
    
    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { username, email, password, confirmPassword, orgName } = registerDto;
    
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });
    
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create organization if provided
    let organizationId: string | null = null;
    if (orgName) {
      const newOrg = this.organizationsRepository.create({
        name: orgName,
        email: `${orgName.toLowerCase().replace(/\s+/g, '-')}@example.com`,
        settings: {
          key_timer: 300,
          storage_config: {
            provider: 'aws_s3',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock-access-key',
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock-secret-key',
            },
            bucket: 'quantumtrust-data',
          },
        },
      });
      
      const savedOrg = await this.organizationsRepository.save(newOrg);
      organizationId = savedOrg.id;
    }
    
    // Create user
    const newUser = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      role: organizationId ? UserRole.ORG_ADMIN : UserRole.ORG_USER,
      organizationId: organizationId,
      permissions: {},
      mfa_enabled: false,
      details: {},
      approved_addresses: [],
      is_active: false,
      approval_status: ApprovalStatus.PENDING,
    });
    
    const savedUser = await this.usersRepository.save(newUser);
    
    // If organization was created, set the admin
    if (organizationId) {
      await this.organizationsRepository.update(
        { id: organizationId },
        { admin_user_id: savedUser.id }
      );
    }
    
    return {
      message: 'Registration successful. Please wait for admin approval.',
      userId: savedUser.id,
    };
  }

  async setupMfa(userId: string): Promise<SetupMfaResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const secret = speakeasy.generateSecret({
      name: `QuantumTrust:${user.username}`,
    });
    
    // Store secret in mfa_secret field
    user.mfa_secret = secret.base32;
    
    await this.usersRepository.save(user);
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  async verifyMfa(userId: string, code: string): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user || !user.mfa_secret) {
      throw new UnauthorizedException('User not found or MFA not set up');
    }
    
    const verified = await this.verifyMfaCode(userId, code);
    
    if (!verified) {
      throw new UnauthorizedException('Invalid MFA code');
    }
    
    // If this is the first successful verification, enable MFA
    if (!user.mfa_enabled) {
      user.mfa_enabled = true;
      await this.usersRepository.save(user);
    }
    
    // Update last login
    user.last_login = new Date();
    await this.usersRepository.save(user);
    
    // Generate token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  private async verifyMfaCode(userId: string, code: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user || !user.mfa_secret) {
      return false;
    }
    
    return speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
    });
  }

  private isAddressApproved(user: User, ipAddress: string, macAddress: string): boolean {
    if (!user.approved_addresses || !Array.isArray(user.approved_addresses)) {
      return false;
    }
    
    return user.approved_addresses.some(
      (address) => address.ip === ipAddress && address.mac === macAddress
    );
  }
  
  async findById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
