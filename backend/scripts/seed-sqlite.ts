import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import * as bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../src/user-management/entities/user.entity';
import { Organization } from '../src/user-management/entities/organization.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Create organization
    const orgRepository = getRepository(Organization);
    const userRepository = getRepository(User);
    
    // Check if data already exists
    const existingUsers = await userRepository.find();
    if (existingUsers.length > 0) {
      console.log('Database already seeded. Skipping...');
      await app.close();
      return;
    }
    
    // Create test organization
    const org = await orgRepository.save({
      name: 'Test Organization',
      email: 'test@org.com',
      phone: '1234567890',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create admin user
    await userRepository.save({
      username: 'admin1',
      email: 'admin@quantumtrust.com',
      password: await bcrypt.hash('Admin@123', 10),
      role: UserRole.ADMIN,
      approved_addresses: [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }],
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create org admin user
    await userRepository.save({
      username: 'orgadmin1',
      email: 'orgadmin@quantumtrust.com',
      password: await bcrypt.hash('Org@123', 10),
      role: UserRole.ORG_ADMIN,
      organizationId: org.id,
      approved_addresses: [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }],
      created_at: new Date(),
      updated_at: new Date()
    });

    // Create regular user
    await userRepository.save({
      username: 'user1',
      email: 'user@quantumtrust.com',
      password: await bcrypt.hash('User@123', 10),
      role: UserRole.ORG_USER,
      organizationId: org.id,
      approved_addresses: [{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }],
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
