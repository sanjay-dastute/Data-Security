import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, ApprovalStatus } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
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

  async findAllByOrganization(organizationId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { organizationId },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
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
    
    // Convert approved_addresses to JSON string for SQLite compatibility
    const approvedAddresses = createUserDto.approved_addresses 
      ? JSON.stringify(createUserDto.approved_addresses)
      : JSON.stringify([]);

    // Create user
    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role || UserRole.ORG_USER,
      approvalStatus: createUserDto.approvalStatus || ApprovalStatus.APPROVED,
      isActivated: createUserDto.isActivated !== undefined ? createUserDto.isActivated : true,
      organizationId: createUserDto.organizationId,
      approved_addresses: approvedAddresses,
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.approvalStatus) user.approvalStatus = updateUserDto.approvalStatus;
    if (updateUserDto.isActivated !== undefined) user.isActivated = updateUserDto.isActivated;
    if (updateUserDto.organizationId) user.organizationId = updateUserDto.organizationId;
    if (updateUserDto.mfa_enabled !== undefined) user.mfa_enabled = updateUserDto.mfa_enabled;
    if (updateUserDto.mfa_secret) user.mfa_secret = updateUserDto.mfa_secret;
    
    // Handle approved_addresses as JSON string
    if (updateUserDto.approved_addresses) {
      user.approved_addresses = JSON.stringify(updateUserDto.approved_addresses);
    }

    return this.usersRepository.save(user);
  }

  async updateApprovalStatus(id: string, status: ApprovalStatus): Promise<User> {
    const user = await this.findOne(id);
    user.approvalStatus = status;
    
    // If approving user, also activate them
    if (status === ApprovalStatus.APPROVED) {
      user.isActivated = true;
    }
    
    return this.usersRepository.save(user);
  }

  async updateEmailVerification(id: string, isVerified: boolean): Promise<User> {
    const user = await this.findOne(id);
    // Email verification is now handled by isActivated
    user.isActivated = isVerified;
    return this.usersRepository.save(user);
  }

  async updateMfaStatus(id: string, isEnabled: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.mfa_enabled = isEnabled;
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async toResponseDto(user: User) {
    // Parse approved_addresses from JSON string
    const approvedAddresses = user.approved_addresses 
      ? JSON.parse(user.approved_addresses as string)
      : [];
      
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      approvalStatus: user.approvalStatus,
      isActivated: user.isActivated,
      organizationId: user.organizationId,
      mfa_enabled: user.mfa_enabled,
      approved_addresses: approvedAddresses,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
