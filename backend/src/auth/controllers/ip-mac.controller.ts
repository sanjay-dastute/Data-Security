import { Controller, Post, Body, UseGuards, Get, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { IpMacService } from '../services/ip-mac.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IpMacDto, ApproveAddressDto } from '../dto/ip-mac.dto';

@Controller('ip-mac')
@UseGuards(JwtAuthGuard)
export class IpMacController {
  constructor(private readonly ipMacService: IpMacService) {}

  @Get(':userId')
  async getApprovedAddresses(@Param('userId') userId: string) {
    return this.ipMacService.getApprovedAddresses(userId);
  }

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  async approveAddress(@Body() approveAddressDto: ApproveAddressDto) {
    return this.ipMacService.addApprovedAddress(
      approveAddressDto.userId,
      {
        ip: approveAddressDto.ip,
        mac: approveAddressDto.mac,
      }
    );
  }

  @Delete('remove')
  @HttpCode(HttpStatus.OK)
  async removeAddress(@Body() approveAddressDto: ApproveAddressDto) {
    return this.ipMacService.removeApprovedAddress(
      approveAddressDto.userId,
      {
        ip: approveAddressDto.ip,
        mac: approveAddressDto.mac,
      }
    );
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateAddress(@Body() body: { userId: string; ip: string; mac: string }) {
    const isValid = await this.ipMacService.validateAddress(
      body.userId,
      body.ip,
      body.mac
    );
    
    return { isValid };
  }
}
