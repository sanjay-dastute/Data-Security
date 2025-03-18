import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user-management/services/user.service';
import { OrganizationService } from '../src/user-management/services/organization.service';
import { UserRole } from '../src/user-management/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const orgService = app.get(OrganizationService);

  try {
    // Create test organization
    const org = await orgService.create({
      name: 'Test Organization',
      email: 'test@org.com',
      phone: '1234567890'
    });

    // Create test users
    await userService.create({
      username: 'admin1',
      email: 'admin@quantumtrust.com',
      password: 'Admin@123',
      role: UserRole.ADMIN,
      approved_addresses: [
        {
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00'
        }
      ]
    });

    await userService.create({
      username: 'orgadmin1',
      email: 'orgadmin@quantumtrust.com',
      password: 'Org@123',
      role: UserRole.ORG_ADMIN,
      organizationId: org.id,
      approved_addresses: [
        {
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00'
        }
      ]
    });

    await userService.create({
      username: 'user1',
      email: 'user@quantumtrust.com', 
      password: 'User@123',
      role: UserRole.ORG_USER,
      organizationId: org.id,
      approved_addresses: [
        {
          ip: '127.0.0.1',
          mac: '00:00:00:00:00:00'
        }
      ]
    });

    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
