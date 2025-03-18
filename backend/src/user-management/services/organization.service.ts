import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationResponseDto } from '../dto/organization.dto';
import { UserResponseDto } from '../dto/user.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10): Promise<{ organizations: OrganizationResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const [organizations, total] = await this.organizationsRepository
      .createQueryBuilder('organization')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    
    return {
      organizations: organizations.map(this.mapToOrganizationResponse),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsRepository.findOne({ where: { id } });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    return this.mapToOrganizationResponse(organization);
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponseDto> {
    // Check if organization with same name already exists
    const existingOrg = await this.organizationsRepository.findOne({
      where: { name: createOrganizationDto.name },
    });
    
    if (existingOrg) {
      throw new ConflictException('Organization with this name already exists');
    }
    
    // Create new organization
    const newOrganization = this.organizationsRepository.create({
      ...createOrganizationDto,
      settings: createOrganizationDto.settings || {},
    });
    
    const savedOrganization = await this.organizationsRepository.save(newOrganization);
    
    return this.mapToOrganizationResponse(savedOrganization);
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsRepository.findOne({ where: { id } });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    // Check if name is being updated and if it already exists
    if (updateOrganizationDto.name && updateOrganizationDto.name !== organization.name) {
      const existingName = await this.organizationsRepository.findOne({
        where: { name: updateOrganizationDto.name },
      });
      
      if (existingName) {
        throw new ConflictException('Organization with this name already exists');
      }
    }
    
    // Update organization
    Object.assign(organization, updateOrganizationDto);
    
    const updatedOrganization = await this.organizationsRepository.save(organization);
    
    return this.mapToOrganizationResponse(updatedOrganization);
  }

  async remove(id: string): Promise<{ message: string }> {
    const organization = await this.organizationsRepository.findOne({ where: { id } });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    
    // Check if organization has users
    const usersCount = await this.usersRepository.count({
      where: { id },
    });
    
    if (usersCount > 0) {
      throw new ConflictException('Cannot delete organization with active users');
    }
    
    await this.organizationsRepository.remove(organization);
    
    return { message: `Organization with ID ${id} has been deleted` };
  }

  async getOrganizationUsers(
    organizationId: string,
    page = 1,
    limit = 10
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    // Check if organization exists
    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId },
    });
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} not found`);
    }
    
    const [users, total] = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.organization_id = :organizationId', { organizationId })
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

  private mapToOrganizationResponse(organization: Organization): OrganizationResponseDto {
    return {
      organization_id: organization.id,
      name: organization.name,
      admin_user_id: organization.admin_user_id,
      settings: organization.settings,
      profile: {}, // Organization entity doesn't have profile, but DTO requires it
      created_at: organization.created_at,
      updated_at: organization.updated_at,
    };
  }

  private mapToUserResponse(user: User): UserResponseDto {
    const { password, ...userResponse } = user;
    return {
      user_id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organization_id: user.organizationId,
      permissions: user.permissions,
      mfa_enabled: user.mfa_enabled,
      details: user.details,
      approved_addresses: user.approved_addresses,
      approval_status: user.approval_status,
      isActivated: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
