import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../src/user-management/entities/user.entity';
import { Organization } from '../src/user-management/entities/organization.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Get repositories
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const orgRepository = app.get<Repository<Organization>>(getRepositoryToken(Organization));
    
    // Create test organization
    const org = new Organization();
    org.name = 'Test Organization';
    org.email = 'test@org.com';
    org.phone = '1234567890';
    org.api_key = 'test-api-key';
    
    const savedOrg = await orgRepository.save(org);
    
    // Create admin user
    const adminUser = new User();
    adminUser.username = 'admin1';
    adminUser.email = 'admin@quantumtrust.com';
    adminUser.password = await bcrypt.hash('Admin@123', 10);
    adminUser.role = UserRole.ADMIN;
    adminUser.approved_addresses = [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }];
    adminUser.is_active = true;
    adminUser.approval_status = 'approved';
    
    await userRepository.save(adminUser);
    
    // Create org admin user
    const orgAdminUser = new User();
    orgAdminUser.username = 'orgadmin1';
    orgAdminUser.email = 'orgadmin@quantumtrust.com';
    orgAdminUser.password = await bcrypt.hash('Org@123', 10);
    orgAdminUser.role = UserRole.ORG_ADMIN;
    orgAdminUser.organizationId = savedOrg.id;
    orgAdminUser.approved_addresses = [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }];
    orgAdminUser.is_active = true;
    orgAdminUser.approval_status = 'approved';
    
    await userRepository.save(orgAdminUser);
    
    // Create regular user
    const regularUser = new User();
    regularUser.username = 'user1';
    regularUser.email = 'user@quantumtrust.com';
    regularUser.password = await bcrypt.hash('User@123', 10);
    regularUser.role = UserRole.ORG_USER;
    regularUser.organizationId = savedOrg.id;
    regularUser.approved_addresses = [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }];
    regularUser.is_active = true;
    regularUser.approval_status = 'approved';
    
    await userRepository.save(regularUser);
    
    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
