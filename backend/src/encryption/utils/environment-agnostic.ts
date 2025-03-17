import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for handling environment-agnostic encryption operations
 * Ensures that encryption processes work consistently across different deployment environments
 * (AWS, Azure, GCP, on-premises) by using temporary storage within the container filesystem
 */
@Injectable()
export class EnvironmentAgnosticService {
  private readonly logger = new Logger(EnvironmentAgnosticService.name);
  private readonly tempDir: string;

  constructor(private readonly configService: ConfigService) {
    // Create a secure temporary directory for encryption operations
    this.tempDir = path.join(
      os.tmpdir(),
      'quantumtrust-temp',
      crypto.randomBytes(16).toString('hex')
    );
    
    // Ensure the directory exists
    fs.mkdirSync(this.tempDir, { recursive: true });
    
    // Set secure permissions (only accessible by the process owner)
    fs.chmodSync(this.tempDir, 0o700);
    
    this.logger.log(`Created secure temporary directory: ${this.tempDir}`);
    
    // Register cleanup handler
    process.on('exit', () => this.cleanup());
    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  /**
   * Creates a temporary file for encryption operations
   * @param prefix Optional prefix for the filename
   * @returns Path to the temporary file
   */
  async createTempFile(prefix = 'data-'): Promise<string> {
    const filename = `${prefix}${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const filePath = path.join(this.tempDir, filename);
    
    // Create an empty file
    fs.writeFileSync(filePath, '');
    
    return filePath;
  }

  /**
   * Writes data to a temporary file
   * @param data Data to write
   * @param prefix Optional prefix for the filename
   * @returns Path to the temporary file
   */
  async writeToTempFile(data: Buffer | string, prefix = 'data-'): Promise<string> {
    const filePath = await this.createTempFile(prefix);
    
    if (Buffer.isBuffer(data)) {
      fs.writeFileSync(filePath, data);
    } else {
      fs.writeFileSync(filePath, data, 'utf8');
    }
    
    return filePath;
  }

  /**
   * Reads data from a temporary file
   * @param filePath Path to the temporary file
   * @returns File contents as a buffer
   */
  async readFromTempFile(filePath: string): Promise<Buffer> {
    if (!filePath.startsWith(this.tempDir)) {
      throw new Error('Attempted to read from a file outside the secure temporary directory');
    }
    
    return fs.readFileSync(filePath);
  }

  /**
   * Deletes a temporary file
   * @param filePath Path to the temporary file
   */
  async deleteTempFile(filePath: string): Promise<void> {
    if (!filePath.startsWith(this.tempDir)) {
      throw new Error('Attempted to delete a file outside the secure temporary directory');
    }
    
    if (fs.existsSync(filePath)) {
      // Securely delete by overwriting with random data before unlinking
      const fileSize = fs.statSync(filePath).size;
      const randomData = crypto.randomBytes(fileSize);
      fs.writeFileSync(filePath, randomData);
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Cleans up all temporary files and directories
   */
  private cleanup(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        // Get all files in the directory
        const files = fs.readdirSync(this.tempDir);
        
        // Securely delete each file
        for (const file of files) {
          const filePath = path.join(this.tempDir, file);
          const fileSize = fs.statSync(filePath).size;
          const randomData = crypto.randomBytes(fileSize);
          fs.writeFileSync(filePath, randomData);
          fs.unlinkSync(filePath);
        }
        
        // Remove the directory
        fs.rmdirSync(this.tempDir);
        
        this.logger.log(`Cleaned up secure temporary directory: ${this.tempDir}`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning up temporary directory: ${error.message}`);
    }
  }

  /**
   * Performs an encryption operation in an environment-agnostic way
   * @param data Data to encrypt
   * @param encryptionFn Function that performs the actual encryption
   * @returns Encrypted data
   */
  async encryptData(
    data: Buffer | string,
    encryptionFn: (data: Buffer) => Promise<Buffer>
  ): Promise<Buffer> {
    // Write data to temporary file
    const inputFilePath = await this.writeToTempFile(data, 'plaintext-');
    
    try {
      // Read data as buffer
      const inputData = await this.readFromTempFile(inputFilePath);
      
      // Perform encryption
      const encryptedData = await encryptionFn(inputData);
      
      return encryptedData;
    } finally {
      // Clean up temporary file
      await this.deleteTempFile(inputFilePath);
    }
  }

  /**
   * Performs a decryption operation in an environment-agnostic way
   * @param encryptedData Encrypted data
   * @param decryptionFn Function that performs the actual decryption
   * @returns Decrypted data
   */
  async decryptData(
    encryptedData: Buffer | string,
    decryptionFn: (data: Buffer) => Promise<Buffer>
  ): Promise<Buffer> {
    // Write encrypted data to temporary file
    const inputFilePath = await this.writeToTempFile(encryptedData, 'encrypted-');
    
    try {
      // Read data as buffer
      const inputData = await this.readFromTempFile(inputFilePath);
      
      // Perform decryption
      const decryptedData = await decryptionFn(inputData);
      
      return decryptedData;
    } finally {
      // Clean up temporary file
      await this.deleteTempFile(inputFilePath);
    }
  }

  /**
   * Processes a large file in chunks to support big data encryption/decryption
   * @param inputFilePath Path to the input file
   * @param processFn Function to process each chunk
   * @param chunkSize Size of each chunk in bytes
   * @returns Path to the output file
   */
  async processLargeFile(
    inputFilePath: string,
    processFn: (chunk: Buffer) => Promise<Buffer>,
    chunkSize = 1024 * 1024 // 1MB chunks by default
  ): Promise<string> {
    const outputFilePath = await this.createTempFile('processed-');
    
    return new Promise((resolve, reject) => {
      try {
        const readStream = fs.createReadStream(inputFilePath, { highWaterMark: chunkSize });
        const writeStream = fs.createWriteStream(outputFilePath);
        
        readStream.on('data', async (chunk: Buffer) => {
          // Pause the read stream while processing the chunk
          readStream.pause();
          
          try {
            // Process the chunk
            const processedChunk = await processFn(chunk);
            
            // Write the processed chunk
            writeStream.write(processedChunk, () => {
              // Resume reading after the write completes
              readStream.resume();
            });
          } catch (error) {
            readStream.destroy();
            writeStream.destroy();
            reject(error);
          }
        });
        
        readStream.on('end', () => {
          writeStream.end(() => {
            resolve(outputFilePath);
          });
        });
        
        readStream.on('error', (error) => {
          writeStream.destroy();
          reject(error);
        });
        
        writeStream.on('error', (error) => {
          readStream.destroy();
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Synchronizes encryption keys across different environments using Fabric
   * @param keyId ID of the key to synchronize
   * @param environments List of environment names to sync to
   */
  async syncKeyAcrossEnvironments(keyId: string, environments: string[]): Promise<void> {
    // This would integrate with the BlockchainService to store the key in Fabric
    // and make it available to all environments
    this.logger.log(`Syncing key ${keyId} across environments: ${environments.join(', ')}`);
    
    // Implementation would depend on the specific Fabric integration
    // This is a placeholder for the actual implementation
  }
}
