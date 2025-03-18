import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { KeyService } from '../services/key.service';
import { CreateKeyDto } from '../dto/key.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('keys')
@UseGuards(JwtAuthGuard)
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Get()
  getUserKeys(@Request() req) {
    return this.keyService.getUserKeys(req.user.id);
  }

  @Post()
  createKey(@Body() createKeyDto: CreateKeyDto, @Request() req) {
    return this.keyService.createKey(
      req.user.id,
      createKeyDto.name,
      createKeyDto.expiration_time,
      createKeyDto.metadata
    );
  }

  @Get(':id')
  getKey(@Param('id') id: string, @Request() req) {
    return this.keyService.getKey(id, req.user.id);
  }

  @Delete(':id')
  revokeKey(@Param('id') id: string, @Request() req) {
    return this.keyService.revokeKey(id, req.user.id);
  }
}
