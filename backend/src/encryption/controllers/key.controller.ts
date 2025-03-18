import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { KeyService } from '../services/key.service';
import { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import { KeyAlgorithm } from '../entities/key.entity';

@Controller('keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Get('organization')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async getOrganizationKeys(@Req() req: RequestWithUser) {
    return this.keyService.getOrganizationKeys(req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async getKey(@Param('id') id: string) {
    return this.keyService.getKeyById(id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async getUserKeys(@Req() req: RequestWithUser) {
    return this.keyService.getUserKeys(req.user.userId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async createKey(@Body() createKeyDto: any, @Req() req: RequestWithUser) {
    try {
      return await this.keyService.createKey(
        req.user.userId,
        req.user.organizationId,
        createKeyDto.algorithm as KeyAlgorithm,
        createKeyDto.isHsmBacked || false
      );
    } catch (error) {
      throw new HttpException(`Failed to create key: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async deleteKey(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      const result = await this.keyService.deleteKey(id);
      if (result) {
        return { success: true, message: 'Key deleted successfully' };
      } else {
        throw new HttpException('Key not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(`Failed to delete key: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/rotate')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async rotateKey(@Param('id') id: string, @Req() req: RequestWithUser) {
    try {
      return await this.keyService.rotateKey(id);
    } catch (error) {
      throw new HttpException(`Failed to rotate key: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
