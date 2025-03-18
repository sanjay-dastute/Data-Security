import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async findByName(name: string): Promise<Organization | undefined> {
    return this.organizationsRepository.findOne({
      where: { name },
    });
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Check if organization with same name already exists
    const existingOrg = await this.findByName(createOrganizationDto.name);
    if (existingOrg) {
      throw new ConflictException('Organization with this name already exists');
    }

    // Default settings for a new organization
    const defaultSettings = {
      encryption_defaults: {
        algorithm: 'AES-256-GCM',
        key_rotation_days: 30
      },
      storage_config: {
        type: 'local',
        path: '/tmp/encrypted'
      }
    };

    // Merge with provided settings if any
    const mergedSettings = createOrganizationDto.settings 
      ? { ...defaultSettings, ...createOrganizationDto.settings }
      : defaultSettings;

    // Create organization with settings as JSON string for SQLite compatibility
    const organization = this.organizationsRepository.create({
      name: createOrganizationDto.name,
      email: createOrganizationDto.email,
      phone: createOrganizationDto.phone,
      api_key: createOrganizationDto.api_key,
      settings: JSON.stringify(mergedSettings)
    });

    const savedOrganization = await this.organizationsRepository.save(organization);
    return savedOrganization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);

    // Update basic fields
    if (updateOrganizationDto.name) organization.name = updateOrganizationDto.name;
    if (updateOrganizationDto.email) organization.email = updateOrganizationDto.email;
    if (updateOrganizationDto.phone) organization.phone = updateOrganizationDto.phone;
    if (updateOrganizationDto.api_key) organization.api_key = updateOrganizationDto.api_key;

    // Handle settings as JSON string
    if (updateOrganizationDto.settings) {
      // Parse existing settings
      const currentSettings = organization.settings 
        ? JSON.parse(organization.settings as string) 
        : {};
      
      // Merge with new settings
      const updatedSettings = {
        ...currentSettings,
        ...updateOrganizationDto.settings,
      };
      
      // Save as JSON string
      organization.settings = JSON.stringify(updatedSettings);
    }

    return this.organizationsRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationsRepository.remove(organization);
  }

  async toResponseDto(organization: Organization) {
    // Parse settings from JSON string
    const settings = organization.settings 
      ? JSON.parse(organization.settings as string)
      : {};
      
    return {
      id: organization.id,
      name: organization.name,
      email: organization.email,
      phone: organization.phone,
      api_key: organization.api_key,
      settings: settings,
      created_at: organization.created_at,
      updated_at: organization.updated_at,
    };
  }

  async getEncryptionDefaults(id: string) {
    const organization = await this.findOne(id);
    
    // Parse settings from JSON string
    const settings = organization.settings 
      ? JSON.parse(organization.settings as string)
      : {};
    
    // Extract encryption defaults with fallbacks
    return {
      encryption: {
        algorithm: settings.encryption_defaults?.algorithm || 'AES-256-GCM',
        key_rotation_interval: settings.encryption_defaults?.key_rotation_days || 30
      },
      storage: {
        type: settings.storage_config?.type || 'local',
        path: settings.storage_config?.path || '/tmp/encrypted',
        cloud_provider: settings.storage_config?.cloud_provider || 'aws',
        bucket: settings.storage_config?.bucket || 'quantumtrust-encrypted'
      }
    };
  }
}
