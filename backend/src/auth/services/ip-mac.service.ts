import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user-management/entities/user.entity';
import { IpMacDto } from '../dto/ip-mac.dto';

@Injectable()
export class IpMacService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateAddress(userId: string, ipAddress: string, macAddress: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return false;
    }
    
    // If no approved addresses yet, return false
    if (!user.approved_addresses || !Array.isArray(user.approved_addresses) || user.approved_addresses.length === 0) {
      return false;
    }
    
    // Check if the IP/MAC pair is in the approved list
    return user.approved_addresses.some(
      (address) => address.ip === ipAddress && address.mac === macAddress
    );
  }

  async addApprovedAddress(userId: string, ipMacDto: IpMacDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Initialize approved_addresses if it doesn't exist
    if (!user.approved_addresses || !Array.isArray(user.approved_addresses)) {
      user.approved_addresses = [];
    }
    
    // Check if address already exists
    const addressExists = user.approved_addresses.some(
      (address) => address.ip === ipMacDto.ip && address.mac === ipMacDto.mac
    );
    
    if (!addressExists) {
      user.approved_addresses.push({
        ip: ipMacDto.ip,
        mac: ipMacDto.mac,
      });
      
      return this.usersRepository.save(user);
    }
    
    return user;
  }

  async removeApprovedAddress(userId: string, ipMacDto: IpMacDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Filter out the address to remove
    if (user.approved_addresses && Array.isArray(user.approved_addresses)) {
      user.approved_addresses = user.approved_addresses.filter(
        (address) => !(address.ip === ipMacDto.ip && address.mac === ipMacDto.mac)
      );
      
      return this.usersRepository.save(user);
    }
    
    return user;
  }

  async getApprovedAddresses(userId: string): Promise<IpMacDto[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.approved_addresses || [];
  }
}
