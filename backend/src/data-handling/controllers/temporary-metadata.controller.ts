import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../user-management/guards/roles.guard';
import { Roles } from '../../user-management/decorators/roles.decorator';
import { UserRole } from '../../user-management/entities/user.entity';
import { TemporaryMetadataService } from '../services/temporary-metadata.service';
import { CreateTemporaryMetadataDto, UpdateTemporaryMetadataDto } from '../dto/temporary-metadata.dto';

@Controller('temporary-metadata')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemporaryMetadataController {
  constructor(private readonly temporaryMetadataService: TemporaryMetadataService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async create(@Body() createDto: CreateTemporaryMetadataDto, @Request() req) {
    // Set user ID if not provided
    if (!createDto.user_id) {
      createDto.user_id = req.user.userId;
    }
    
    return this.temporaryMetadataService.create(createDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async findAll(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.userId;
    
    return this.temporaryMetadataService.findAll(userId, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async findOne(@Param('id') id: string, @Request() req) {
    const metadata = await this.temporaryMetadataService.findOne(id);
    
    // Check if user has access to this metadata
    if (req.user.role !== UserRole.ADMIN) {
      if (metadata.user_id !== req.user.userId) {
        throw new BadRequestException('You do not have access to this metadata');
      }
    }
    
    return metadata;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTemporaryMetadataDto,
    @Request() req,
  ) {
    const metadata = await this.temporaryMetadataService.findOne(id);
    
    // Check if user has access to this metadata
    if (req.user.role !== UserRole.ADMIN) {
      if (metadata.user_id !== req.user.userId) {
        throw new BadRequestException('You do not have access to this metadata');
      }
    }
    
    return this.temporaryMetadataService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ORG_ADMIN, UserRole.ORG_USER)
  async remove(@Param('id') id: string, @Request() req) {
    const metadata = await this.temporaryMetadataService.findOne(id);
    
    // Check if user has access to this metadata
    if (req.user.role !== UserRole.ADMIN) {
      if (metadata.user_id !== req.user.userId) {
        throw new BadRequestException('You do not have access to this metadata');
      }
    }
    
    return this.temporaryMetadataService.remove(id);
  }
}
