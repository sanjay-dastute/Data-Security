import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user-management/services/user.service';
import { OrganizationService } from '../src/user-management/services/organization.service';
import { UserRole, ApprovalStatus } from '../src/user-management/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const orgService = app.get(OrganizationService);

  try {
    console.log('Starting to seed test data...');

    // Create test organization
    const org = await orgService.create({
      name: 'Test Organization',
      email: 'test@organization.com',
      phone: '1234567890',
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
        encryption_defaults: {
          algorithm: 'AES',
          key_size: 256,
          use_hsm: false,
        },
      },
    });

    console.log('Created test organization:', org.name);

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const orgAdminPassword = await bcrypt.hash('Org@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // Create admin user
    const admin = await userService.create({
      username: 'admin1',
      email: 'admin@quantumtrust.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      is_active: true,
      approval_status: ApprovalStatus.APPROVED,
      approved_addresses: [
        {
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00'
        }
      ],
      details: {
        name: 'Admin User',
        phone: '1234567890',
      },
    });

    console.log('Created admin user:', admin.username);

    // Create organization admin user
    const orgAdmin = await userService.create({
      username: 'orgadmin1',
      email: 'orgadmin@quantumtrust.com',
      password: orgAdminPassword,
      role: UserRole.ORG_ADMIN,
      organization_id: org.organization_id || org.id,
      is_active: true,
      approval_status: ApprovalStatus.APPROVED,
      approved_addresses: [
        {
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00'
        }
      ],
      details: {
        name: 'Organization Admin',
        phone: '1234567891',
      },
    });

    console.log('Created organization admin user:', orgAdmin.username);

    // Update organization with admin user
    await orgService.update(org.organization_id || org.id, {
      admin_user_id: orgAdmin.user_id || orgAdmin.id,
    });

    // Create regular user
    const user = await userService.create({
      username: 'user1',
      email: 'user@quantumtrust.com',
      password: userPassword,
      role: UserRole.ORG_USER,
      organization_id: org.organization_id || org.id,
      is_active: true,
      approval_status: ApprovalStatus.APPROVED,
      approved_addresses: [
        {
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00'
        }
      ],
      details: {
        name: 'Regular User',
        phone: '1234567892',
      },
    });

    console.log('Created regular user:', user.username);

    console.log('Test data seeded successfully!');
    console.log('Test credentials:');
    console.log('Admin: admin1 / Admin@123');
    console.log('Org Admin: orgadmin1 / Org@123');
    console.log('User: user1 / User@123');
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
