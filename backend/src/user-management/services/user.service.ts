import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10, role?: UserRole): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    
    if (role) {
      queryBuilder.where('user.role = :role', { role });
    }
    
    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return {
      users: users.map(this.mapToUserResponse),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.mapToUserResponse(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    
    // Create new user
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password_hash: passwordHash,
      mfa_enabled: false,
      details: createUserDto.details || {},
      approved_addresses: [],
      isActivated: false,
      approvalStatus: 'pending',
    });
    
    const savedUser = await this.usersRepository.save(newUser);
    
    return this.mapToUserResponse(savedUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Check if username or email is being updated and if it already exists
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.findByUsername(updateUserDto.username);
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }
    
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    
    // Update user
    Object.assign(user, updateUserDto);
    
    const updatedUser = await this.usersRepository.save(user);
    
    return this.mapToUserResponse(updatedUser);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    await this.usersRepository.remove(user);
    
    return { message: `User with ID ${id} has been deleted` };
  }

  async approveUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.approvalStatus = 'approved';
    
    const updatedUser = await this.usersRepository.save(user);
    
    return this.mapToUserResponse(updatedUser);
  }

  async rejectUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.approvalStatus = 'rejected';
    
    const updatedUser = await this.usersRepository.save(user);
    
    return this.mapToUserResponse(updatedUser);
  }

  async activateUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.isActivated = true;
    
    const updatedUser = await this.usersRepository.save(user);
    
    return this.mapToUserResponse(updatedUser);
  }

  async deactivateUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { user_id: id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    user.isActivated = false;
    
    const updatedUser = await this.usersRepository.save(user);
    
    return this.mapToUserResponse(updatedUser);
  }

  private mapToUserResponse(user: User): UserResponseDto {
    const { password_hash, ...userResponse } = user;
    return userResponse as UserResponseDto;
  }
}
