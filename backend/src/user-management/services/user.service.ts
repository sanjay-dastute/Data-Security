import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus, ApprovalStatus } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({ where: { organizationId } });
  }

  async create(createUserDto: any): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role || UserRole.ORG_USER,
      status: UserStatus.PENDING,
      approval_status: ApprovalStatus.PENDING,
      organizationId: createUserDto.organizationId,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      phone: createUserDto.phone,
      approved_addresses: createUserDto.approved_addresses || [],
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const user = await this.findById(id);

    // Update fields
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.status) user.status = updateUserDto.status;
    if (updateUserDto.approval_status) user.approval_status = updateUserDto.approval_status;
    if (updateUserDto.organizationId) user.organizationId = updateUserDto.organizationId;
    if (updateUserDto.first_name) user.first_name = updateUserDto.first_name;
    if (updateUserDto.last_name) user.last_name = updateUserDto.last_name;
    if (updateUserDto.phone) user.phone = updateUserDto.phone;
    if (updateUserDto.is_mfa_enabled !== undefined) user.is_mfa_enabled = updateUserDto.is_mfa_enabled;
    if (updateUserDto.mfa_secret) user.mfa_secret = updateUserDto.mfa_secret;
    if (updateUserDto.approved_addresses) user.approved_addresses = updateUserDto.approved_addresses;
    if (updateUserDto.preferences) user.preferences = updateUserDto.preferences;
    if (updateUserDto.metadata) user.metadata = updateUserDto.metadata;

    return this.usersRepository.save(user);
  }

  async updateApprovalStatus(id: string, status: ApprovalStatus): Promise<User> {
    const user = await this.findById(id);
    user.approval_status = status;
    
    // If approved, also set status to active
    if (status === ApprovalStatus.APPROVED) {
      user.status = UserStatus.ACTIVE;
      user.is_activated = true;
    }
    
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findById(id);
    user.password = await bcrypt.hash(newPassword, 10);
    return this.usersRepository.save(user);
  }

  async updateEmailVerification(id: string, isVerified: boolean): Promise<User> {
    const user = await this.findById(id);
    user.is_email_verified = isVerified;
    return this.usersRepository.save(user);
  }

  async updateMfaStatus(id: string, isEnabled: boolean, secret?: string): Promise<User> {
    const user = await this.findById(id);
    user.is_mfa_enabled = isEnabled;
    if (secret) {
      user.mfa_secret = secret;
    }
    return this.usersRepository.save(user);
  }

  async getUserProfile(id: string): Promise<any> {
    const user = await this.findById(id);
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      approval_status: user.approval_status,
      is_email_verified: user.is_email_verified,
      is_mfa_enabled: user.is_mfa_enabled,
      organizationId: user.organizationId,
      preferences: user.preferences,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
