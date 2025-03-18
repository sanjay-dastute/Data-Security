import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { EncryptionService } from '../services/encryption.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BlockchainService } from '../services/blockchain.service';

@Controller('encryption')
@UseGuards(JwtAuthGuard)
export class EncryptionController {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post('encrypt')
  async encrypt(
    @Body() body: { keyId: string; data: any },
    @Request() req,
  ) {
    const encryptedData = await this.encryptionService.encryptData(
        req.user.id,
        body.keyId,
        body.data,
    );

    // Log encryption event to blockchain
    await this.blockchainService.logEvent({
      user_id: req.user.id,
      event_type: 'data_encryption',
      timestamp: new Date(),
      metadata: {
        key_id: body.keyId,
        data_size: JSON.stringify(body.data).length,
      },
    });

    return encryptedData;
  }

  @Post('decrypt')
  async decrypt(
    @Body() body: { keyId: string; encryptedData: string },
    @Request() req,
  ) {
    const decryptedData = await this.encryptionService.decryptData(
        req.user.id,
        body.keyId,
        body.encryptedData,
    );

    // Log decryption event to blockchain
    await this.blockchainService.logEvent({
      user_id: req.user.id,
      event_type: 'data_decryption',
      timestamp: new Date(),
      metadata: {
        key_id: body.keyId,
      },
    });

    return decryptedData;
  }
}
