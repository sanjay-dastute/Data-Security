import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
  ],
  controllers: [UserController, OrganizationController],
  providers: [UserService, OrganizationService, RolesGuard],
  exports: [UserService, OrganizationService],
})
export class UserManagementModule {}
