import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';
import { AddressDto } from '../dto/ip-mac.dto';

@Injectable()
export class IpMacService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUserApprovedAddresses(userId: string): Promise<any[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Parse approved_addresses from JSON string
    return user.approved_addresses ? JSON.parse(user.approved_addresses as string) : [];
  }

  async isAddressApproved(userId: string, ip: string, mac: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Parse approved_addresses from JSON string
    const approvedAddresses = user.approved_addresses ? JSON.parse(user.approved_addresses as string) : [];
    
    return approvedAddresses.some(
      (addr: any) => addr.ip === ip && addr.mac === mac
    );
  }

  async clearApprovedAddresses(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Set approved_addresses to empty array as JSON string
    user.approved_addresses = JSON.stringify([]);
    
    return this.usersRepository.save(user);
  }

  async addApprovedAddress(userId: string, addressDto: AddressDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Parse approved_addresses from JSON string
    const approvedAddresses = user.approved_addresses ? JSON.parse(user.approved_addresses as string) : [];
    
    const addressExists = approvedAddresses.some(
      (addr: any) => addr.ip === addressDto.ip && addr.mac === addressDto.mac
    );
    
    if (!addressExists) {
      approvedAddresses.push({
        ip: addressDto.ip,
        mac: addressDto.mac,
        added: new Date(),
        last_used: null
      });
      
      // Save approved_addresses as JSON string
      user.approved_addresses = JSON.stringify(approvedAddresses);
      return this.usersRepository.save(user);
    }
    
    return user;
  }

  async removeApprovedAddress(userId: string, addressDto: AddressDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Parse approved_addresses from JSON string
    const approvedAddresses = user.approved_addresses ? JSON.parse(user.approved_addresses as string) : [];
    
    // Filter out the address to remove
    const filteredAddresses = approvedAddresses.filter(
      (addr: any) => !(addr.ip === addressDto.ip && addr.mac === addressDto.mac)
    );
    
    // Save approved_addresses as JSON string
    user.approved_addresses = JSON.stringify(filteredAddresses);
    
    return this.usersRepository.save(user);
  }

  async updateLastUsed(userId: string, ip: string, mac: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Parse approved_addresses from JSON string
    const approvedAddresses = user.approved_addresses ? JSON.parse(user.approved_addresses as string) : [];
    
    const addressIndex = approvedAddresses.findIndex(
      (addr: any) => addr.ip === ip && addr.mac === mac
    );
    
    if (addressIndex !== -1) {
      approvedAddresses[addressIndex].last_used = new Date();
      
      // Save approved_addresses as JSON string
      user.approved_addresses = JSON.stringify(approvedAddresses);
      await this.usersRepository.save(user);
    }
  }
}
