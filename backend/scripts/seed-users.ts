import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, ApprovalStatus } from '../src/user-management/entities/user.entity';
import { Organization } from '../src/user-management/entities/organization.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  try {
    console.log('Starting database seeding...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get repositories
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const orgRepository = app.get<Repository<Organization>>(getRepositoryToken(Organization));
    
    // Check if users already exist
    const adminExists = await userRepository.findOne({ where: { username: 'admin1' } });
    if (adminExists) {
      console.log('Users already exist. Skipping seeding.');
      await app.close();
      return;
    }
    
    console.log('Creating default organization...');
    // Create default organization
    const organization = new Organization();
    const orgId = '550e8400-e29b-41d4-a716-446655440000'; // UUID format
    organization.id = orgId;
    organization.name = 'ABC Corp';
    organization.email = 'admin@abc.com';
    organization.api_key = 'abc-org-api-key-123';
    organization.settings = {
      storage_config: {
        provider: 'local',
        credentials: {
          access_key: 'test-access-key',
          secret_key: 'test-secret-key'
        }
      },
      encryption_defaults: {
        algorithm: 'AES-256-GCM',
        key_size: 256,
        use_hsm: false
      }
    };
    
    await orgRepository.save(organization);
    console.log('Organization created successfully.');
    
    // Hash passwords
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
    const orgAdminPassword = await bcrypt.hash('Org@123', saltRounds);
    const userPassword = await bcrypt.hash('User@123', saltRounds);
    
    console.log('Creating admin user...');
    // Create admin user
    const admin = new User();
    admin.username = 'admin1';
    admin.email = 'admin1@quantumtrust.com';
    admin.password = adminPassword;
    admin.role = UserRole.ADMIN;
    admin.is_active = true;
    admin.approval_status = ApprovalStatus.APPROVED;
    admin.approved_addresses = [{ ip: '127.0.0.1', mac: 'default' }];
    
    await userRepository.save(admin);
    console.log('Admin user created successfully.');
    
    console.log('Creating org admin user...');
    // Create org admin user
    const orgAdmin = new User();
    orgAdmin.username = 'orgadmin1';
    orgAdmin.email = 'orgadmin1@abc.com';
    orgAdmin.password = orgAdminPassword;
    orgAdmin.role = UserRole.ORG_ADMIN;
    orgAdmin.organizationId = orgId;
    orgAdmin.is_active = true;
    orgAdmin.approval_status = ApprovalStatus.APPROVED;
    orgAdmin.approved_addresses = [{ ip: '127.0.0.1', mac: 'default' }];
    
    await userRepository.save(orgAdmin);
    console.log('Org admin user created successfully.');
    
    // Update organization with admin user
    organization.admin_user_id = orgAdmin.id;
    await orgRepository.save(organization);
    
    console.log('Creating regular user...');
    // Create regular user
    const regularUser = new User();
    regularUser.username = 'user1';
    regularUser.email = 'user1@abc.com';
    regularUser.password = userPassword;
    regularUser.role = UserRole.ORG_USER;
    regularUser.organizationId = orgId;
    regularUser.is_active = true;
    regularUser.approval_status = ApprovalStatus.APPROVED;
    regularUser.approved_addresses = [{ ip: '127.0.0.1', mac: 'default' }];
    
    await userRepository.save(regularUser);
    console.log('Regular user created successfully.');
    
    console.log('Database seeding completed successfully.');
    
    await app.close();
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

bootstrap();
