import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { KeyService } from '../services/key.service';
import { CreateKeyDto, UpdateKeyDto, KeyResponseDto, KeyRecoveryRequestDto, KeyShardDto, KeyRotationDto, KeyType } from '../dto/key.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';

@Controller('keys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async findAll(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyType') keyType?: KeyType,
  ) {
    // Admin can see all keys
    if (req.user.role === UserRole.ADMIN) {
      return this.keyService.findAll(page, limit, null, null, keyType);
    }
    
    // Org admin can see all keys for their organization
    if (req.user.role === UserRole.ORG_ADMIN) {
      return this.keyService.findAll(page, limit, null, req.user.organization_id, keyType);
    }
    
    // Org user can only see their own keys
    return this.keyService.findAll(page, limit, req.user.userId, null, keyType);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async findOne(@Param('id') id: string, @Request() req) {
    const key = await this.keyService.findOne(id);
    
    // Check if user has access to this key
    if (req.user.role !== UserRole.ADMIN) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        if (key.organization_id !== req.user.organization_id) {
          throw new Error('You do not have access to this key');
        }
      } else if (key.user_id !== req.user.userId) {
        throw new Error('You do not have access to this key');
      }
    }
    
    return key;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async create(@Body() createKeyDto: CreateKeyDto, @Request() req) {
    // Set user_id to current user if not provided
    if (!createKeyDto.user_id) {
      createKeyDto.user_id = req.user.userId;
    }
    
    // Check if user has permission to create key for another user
    if (createKeyDto.user_id !== req.user.userId) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        // Org admin can create keys for users in their organization
        // In a real implementation, we would check if the user is in the org admin's organization
      } else if (req.user.role !== UserRole.ADMIN) {
        throw new Error('You do not have permission to create keys for other users');
      }
    }
    
    // Set organization_id if not provided
    if (!createKeyDto.organization_id && req.user.organization_id) {
      createKeyDto.organization_id = req.user.organization_id;
    }
    
    return this.keyService.create(createKeyDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async update(@Param('id') id: string, @Body() updateKeyDto: UpdateKeyDto, @Request() req) {
    const key = await this.keyService.findOne(id);
    
    // Check if user has access to this key
    if (req.user.role !== UserRole.ADMIN) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        if (key.organization_id !== req.user.organization_id) {
          throw new Error('You do not have access to this key');
        }
      } else if (key.user_id !== req.user.userId) {
        throw new Error('You do not have access to this key');
      }
    }
    
    return this.keyService.update(id, updateKeyDto);
  }

  @Post(':id/rotate')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async rotateKey(@Param('id') id: string, @Body() keyRotationDto: KeyRotationDto, @Request() req) {
    const key = await this.keyService.findOne(id);
    
    // Check if user has access to this key
    if (req.user.role !== UserRole.ADMIN) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        if (key.organization_id !== req.user.organization_id) {
          throw new Error('You do not have access to this key');
        }
      } else if (key.user_id !== req.user.userId) {
        throw new Error('You do not have access to this key');
      }
    }
    
    // Update timer interval if provided
    if (keyRotationDto.new_timer_interval !== undefined) {
      await this.keyService.update(id, { timer_interval: keyRotationDto.new_timer_interval });
    }
    
    return this.keyService.rotateKey(id);
  }

  @Post(':id/shards')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async createKeyShards(
    @Param('id') id: string,
    @Body() shardData: { num_shards: number; threshold: number },
    @Request() req,
  ) {
    const key = await this.keyService.findOne(id);
    
    // Check if user has access to this key
    if (req.user.role !== UserRole.ADMIN) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        if (key.organization_id !== req.user.organization_id) {
          throw new Error('You do not have access to this key');
        }
      } else {
        throw new Error('You do not have permission to create key shards');
      }
    }
    
    await this.keyService.createKeyShards(id, shardData.num_shards, shardData.threshold);
    
    return { message: 'Key shards created successfully' };
  }

  @Post(':id/recover')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async recoverKey(
    @Param('id') id: string,
    @Body() recoveryData: { shards: Record<string, string> },
    @Request() req,
  ) {
    const key = await this.keyService.findOne(id);
    
    // Check if user has access to this key
    if (req.user.role !== UserRole.ADMIN) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        if (key.organization_id !== req.user.organization_id) {
          throw new Error('You do not have access to this key');
        }
      } else {
        throw new Error('You do not have permission to recover keys');
      }
    }
    
    return this.keyService.recoverKeyFromShards(id, recoveryData.shards);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN)
  async deactivateKey(@Param('id') id: string, @Request() req) {
    const key = await this.keyService.findOne(id);
    
    // Check if user has access to this key
    if (req.user.role !== UserRole.ADMIN) {
      if (req.user.role === UserRole.ORG_ADMIN) {
        if (key.organization_id !== req.user.organization_id) {
          throw new Error('You do not have access to this key');
        }
      } else {
        throw new Error('You do not have permission to deactivate keys');
      }
    }
    
    return this.keyService.deactivateKey(id);
  }
}
