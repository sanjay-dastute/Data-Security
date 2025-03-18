import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { KeyService } from './key.service';
import { HsmService } from './hsm.service';
import { BlockchainService } from './blockchain.service';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);

  constructor(
    private keyService: KeyService,
    private hsmService: HsmService,
    private blockchainService: BlockchainService,
  ) {}

  async encryptData(
    data: string | Record<string, any>,
    keyId: string,
    selectedFields?: string[],
  ): Promise<{ encryptedData: string | Record<string, any>; encryptedFields: string[] }> {
    try {
      // Get key information
      const key = await this.keyService.findOne(keyId);
      
      // Check if key is valid for encryption
      if (key.key_type !== 'encryption') {
        throw new BadRequestException('The provided key is not an encryption key');
      }
      
      // Check if HSM is available
      const useHsm = await this.hsmService.isConfigured();
      
      // Process data based on type
      if (typeof data === 'string') {
        // Encrypt entire string
        const encryptedData = useHsm
          ? await this.hsmService.encryptWithHsm(data, keyId)
          : await this.encryptWithSoftware(data, keyId);
        
        // Log encryption event to blockchain
        await this.blockchainService.logKeyEvent({
          key_id: keyId,
          user_id: key.user_id,
          organization_id: key.organization_id,
          event_type: 'updated',
          timestamp: new Date(),
          metadata: {
            operation: 'encrypt',
            data_type: 'string',
          },
        });
        
        return { encryptedData, encryptedFields: ['*'] };
      } else if (typeof data === 'object' && data !== null) {
        // Selective field encryption for objects
        const encryptedData = { ...data };
        const encryptedFields: string[] = [];
        
        // If no fields are selected, encrypt all fields
        const fieldsToEncrypt = selectedFields || Object.keys(data);
        
        // Encrypt selected fields
        for (const field of fieldsToEncrypt) {
          if (data[field] !== undefined) {
            encryptedData[field] = useHsm
              ? await this.hsmService.encryptWithHsm(
                  typeof data[field] === 'object' ? JSON.stringify(data[field]) : String(data[field]),
                  keyId,
                )
              : await this.encryptWithSoftware(
                  typeof data[field] === 'object' ? JSON.stringify(data[field]) : String(data[field]),
                  keyId,
                );
            encryptedFields.push(field);
          }
        }
        
        // Log encryption event to blockchain
        await this.blockchainService.logKeyEvent({
          key_id: keyId,
          user_id: key.user_id,
          organization_id: key.organization_id,
          event_type: 'updated',
          timestamp: new Date(),
          metadata: {
            operation: 'encrypt',
            data_type: 'object',
            fields: encryptedFields,
          },
        });
        
        return { encryptedData, encryptedFields };
      } else {
        throw new BadRequestException('Unsupported data type for encryption');
      }
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw error;
    }
  }

  async decryptData(
    encryptedData: string | Record<string, any>,
    keyId: string,
    encryptedFields?: string[],
  ): Promise<string | Record<string, any>> {
    try {
      // Get key information
      const key = await this.keyService.findOne(keyId);
      
      // Check if key is valid for encryption
      if (key.key_type !== 'encryption') {
        throw new BadRequestException('The provided key is not an encryption key');
      }
      
      // Check if HSM is available
      const useHsm = await this.hsmService.isConfigured();
      
      // Process data based on type
      if (typeof encryptedData === 'string') {
        // Decrypt entire string
        const decryptedData = useHsm
          ? await this.hsmService.decryptWithHsm(encryptedData, keyId)
          : await this.decryptWithSoftware(encryptedData, keyId);
        
        // Log decryption event to blockchain
        await this.blockchainService.logKeyEvent({
          key_id: keyId,
          user_id: key.user_id,
          organization_id: key.organization_id,
          event_type: 'updated',
          timestamp: new Date(),
          metadata: {
            operation: 'decrypt',
            data_type: 'string',
          },
        });
        
        return decryptedData;
      } else if (typeof encryptedData === 'object' && encryptedData !== null) {
        // Selective field decryption for objects
        const decryptedData = { ...encryptedData };
        
        // If no fields are specified, decrypt all fields that look encrypted
        const fieldsToDecrypt = encryptedFields || this.detectEncryptedFields(encryptedData);
        
        // Decrypt selected fields
        for (const field of fieldsToDecrypt) {
          if (encryptedData[field] !== undefined) {
            try {
              decryptedData[field] = useHsm
                ? await this.hsmService.decryptWithHsm(String(encryptedData[field]), keyId)
                : await this.decryptWithSoftware(String(encryptedData[field]), keyId);
              
              // Try to parse JSON if the decrypted value looks like JSON
              if (typeof decryptedData[field] === 'string' && 
                  decryptedData[field].startsWith('{') && 
                  decryptedData[field].endsWith('}')) {
                try {
                  decryptedData[field] = JSON.parse(decryptedData[field]);
                } catch (e) {
                  // Not valid JSON, keep as string
                }
              }
            } catch (e) {
              // If decryption fails for a field, leave it as is
              this.logger.warn(`Failed to decrypt field ${field}: ${e.message}`);
            }
          }
        }
        
        // Log decryption event to blockchain
        await this.blockchainService.logKeyEvent({
          key_id: keyId,
          user_id: key.user_id,
          organization_id: key.organization_id,
          event_type: 'updated',
          timestamp: new Date(),
          metadata: {
            operation: 'decrypt',
            data_type: 'object',
            fields: fieldsToDecrypt,
          },
        });
        
        return decryptedData;
      } else {
        throw new BadRequestException('Unsupported data type for decryption');
      }
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw error;
    }
  }

  async signData(data: string, keyId: string): Promise<string> {
    try {
      // Get key information
      const key = await this.keyService.findOne(keyId);
      
      // Check if key is valid for signing
      if (key.key_type !== 'signing') {
        throw new BadRequestException('The provided key is not a signature key');
      }
      
      // Check if HSM is available
      const useHsm = await this.hsmService.isConfigured();
      
      // Sign data
      const signature = useHsm
        ? await this.hsmService.signWithHsm(data, keyId)
        : await this.signWithSoftware(data, keyId);
      
      // Log signing event to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: keyId,
        user_id: key.user_id,
        organization_id: key.organization_id,
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          operation: 'sign',
        },
      });
      
      return signature;
    } catch (error) {
      this.logger.error(`Signing failed: ${error.message}`);
      throw error;
    }
  }

  async verifySignature(data: string, signature: string, keyId: string): Promise<boolean> {
    try {
      // Get key information
      const key = await this.keyService.findOne(keyId);
      
      // Check if key is valid for signing
      if (key.key_type !== 'signing') {
        throw new BadRequestException('The provided key is not a signature key');
      }
      
      // Check if HSM is available
      const useHsm = await this.hsmService.isConfigured();
      
      // Verify signature
      const isValid = useHsm
        ? await this.hsmService.verifyWithHsm(data, signature, keyId)
        : await this.verifyWithSoftware(data, signature, keyId);
      
      // Log verification event to blockchain
      await this.blockchainService.logKeyEvent({
        key_id: keyId,
        user_id: key.user_id,
        organization_id: key.organization_id,
        event_type: 'updated',
        timestamp: new Date(),
        metadata: {
          operation: 'verify',
          result: isValid,
        },
      });
      
      return isValid;
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      throw error;
    }
  }

  // Helper methods for software-based cryptography
  private async encryptWithSoftware(data: string, keyId: string): Promise<string> {
    // In a real implementation, we would use libsodium for quantum-resistant encryption
    // For now, we use AES-256-GCM for demonstration
    
    // Generate a random IV
    const iv = crypto.randomBytes(16);
    
    // Use the key ID as the encryption key (in a real implementation, we would retrieve the actual key)
    const key = crypto.createHash('sha256').update(keyId).digest();
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return IV, encrypted data, and auth tag
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  private async decryptWithSoftware(encryptedData: string, keyId: string): Promise<string> {
    // Parse encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new BadRequestException('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Use the key ID as the encryption key (in a real implementation, we would retrieve the actual key)
    const key = crypto.createHash('sha256').update(keyId).digest();
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async signWithSoftware(data: string, keyId: string): Promise<string> {
    // In a real implementation, we would use libsodium for quantum-resistant signatures
    // For now, we use HMAC-SHA256 for demonstration
    
    // Use the key ID as the signing key (in a real implementation, we would retrieve the actual key)
    const key = crypto.createHash('sha256').update(keyId).digest();
    
    // Create HMAC
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    
    // Return signature
    return hmac.digest('hex');
  }

  private async verifyWithSoftware(data: string, signature: string, keyId: string): Promise<boolean> {
    // In a real implementation, we would use libsodium for quantum-resistant signatures
    // For now, we use HMAC-SHA256 for demonstration
    
    // Use the key ID as the signing key (in a real implementation, we would retrieve the actual key)
    const key = crypto.createHash('sha256').update(keyId).digest();
    
    // Create HMAC
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    
    // Compute expected signature
    const expectedSignature = hmac.digest('hex');
    
    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  }

  private detectEncryptedFields(data: Record<string, any>): string[] {
    // Detect fields that look like they might be encrypted
    // This is a simple heuristic and might need to be adjusted based on the actual encryption format
    const encryptedFields: string[] = [];
    
    for (const [field, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.includes(':') && /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/.test(value)) {
        encryptedFields.push(field);
      }
    }
    
    return encryptedFields;
  }
}
