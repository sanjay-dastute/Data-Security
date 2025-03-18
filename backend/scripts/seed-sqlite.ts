import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, ApprovalStatus } from '../src/user-management/entities/user.entity';
import { Organization } from '../src/user-management/entities/organization.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Get repositories
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const orgRepository = app.get<Repository<Organization>>(getRepositoryToken(Organization));

    // Create test organization
    const org = await orgRepository.save({
      name: 'Test Organization',
      email: 'test@org.com',
      phone: '1234567890',
      settings: JSON.stringify({
        encryption_defaults: {
          algorithm: 'AES-256-GCM',
          key_rotation_days: 30
        },
        storage_config: {
          type: 'local',
          path: '/tmp/encrypted'
        }
      })
    });

    // Create admin user
    await userRepository.save({
      username: 'admin1',
      email: 'admin@quantumtrust.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: UserRole.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
      isActivated: true,
      approved_addresses: JSON.stringify([{
        ip: '127.0.0.1',
        mac: '00:00:00:00:00:00',
        added: new Date(),
        last_used: null
      }])
    });

    // Create org admin user
    await userRepository.save({
      username: 'orgadmin1',
      email: 'orgadmin@quantumtrust.com',
      password: await bcrypt.hash('Org@123', 10),
      role: UserRole.ORG_ADMIN,
      organizationId: org.id,
      approvalStatus: ApprovalStatus.APPROVED,
      isActivated: true,
      approved_addresses: JSON.stringify([{
        ip: '127.0.0.1',
        mac: '00:00:00:00:00:00',
        added: new Date(),
        last_used: null
      }])
    });

    // Create regular user
    await userRepository.save({
      username: 'user1',
      email: 'user@quantumtrust.com',
      password: await bcrypt.hash('User@123', 10),
      role: UserRole.ORG_USER,
      organizationId: org.id,
      approvalStatus: ApprovalStatus.APPROVED,
      isActivated: true,
      approved_addresses: JSON.stringify([{
        ip: '127.0.0.1',
        mac: '00:00:00:00:00:00',
        added: new Date(),
        last_used: null
      }])
    });

    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
