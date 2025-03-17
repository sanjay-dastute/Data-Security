import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataHandlingModule } from '../data-handling.module';
import { TemporaryMetadataService } from '../services/temporary-metadata.service';
import { FileParserService } from '../services/file-parser.service';
import { StorageService } from '../services/storage.service';
import { SelfDestructScriptGenerator } from '../utils/self-destruct';
import { EncryptionModule } from '../../encryption/encryption.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemporaryMetadata } from '../entities/temporary-metadata.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { DataFormat, StorageType } from '../dto/temporary-metadata.dto';

describe('DataHandling Integration Tests', () => {
  let app: INestApplication;
  let temporaryMetadataService: TemporaryMetadataService;
  let fileParserService: FileParserService;
  let storageService: StorageService;
  let selfDestructScriptGenerator: SelfDestructScriptGenerator;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [TemporaryMetadata],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([TemporaryMetadata]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        DataHandlingModule,
        EncryptionModule,
      ],
    })
      .overrideProvider(EncryptionModule)
      .useValue({
        // Mock encryption module
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    temporaryMetadataService = moduleFixture.get<TemporaryMetadataService>(TemporaryMetadataService);
    fileParserService = moduleFixture.get<FileParserService>(FileParserService);
    storageService = moduleFixture.get<StorageService>(StorageService);
    selfDestructScriptGenerator = moduleFixture.get<SelfDestructScriptGenerator>(SelfDestructScriptGenerator);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TemporaryMetadataService', () => {
    it('should create a temporary metadata entry', async () => {
      const createDto = {
        file_name: 'test.json',
        file_type: 'application/json',
        user_id: 'test-user-id',
        fields_encrypted: ['field1', 'field2'],
        encrypted_file_path: '/path/to/file',
      };

      const result = await temporaryMetadataService.create(createDto);

      expect(result).toBeDefined();
      expect(result.file_name).toBe(createDto.file_name);
      expect(result.file_type).toBe(createDto.file_type);
      expect(result.user_id).toBe(createDto.user_id);
      expect(result.fields_encrypted).toEqual(createDto.fields_encrypted);
      expect(result.encrypted_file_path).toBe(createDto.encrypted_file_path);
    });

    it('should find all temporary metadata entries for a user', async () => {
      const userId = 'test-user-id';
      const result = await temporaryMetadataService.findAll(userId);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeDefined();
    });

    it('should find a temporary metadata entry by ID', async () => {
      // First create a metadata entry
      const createDto = {
        file_name: 'test2.json',
        file_type: 'application/json',
        user_id: 'test-user-id',
        fields_encrypted: ['field1', 'field2'],
        encrypted_file_path: '/path/to/file2',
      };

      const created = await temporaryMetadataService.create(createDto);
      
      // Then find it by ID
      const result = await temporaryMetadataService.findOne(created.data_id);

      expect(result).toBeDefined();
      expect(result.data_id).toBe(created.data_id);
      expect(result.file_name).toBe(createDto.file_name);
    });

    it('should update a temporary metadata entry', async () => {
      // First create a metadata entry
      const createDto = {
        file_name: 'test3.json',
        file_type: 'application/json',
        user_id: 'test-user-id',
        fields_encrypted: ['field1', 'field2'],
        encrypted_file_path: '/path/to/file3',
      };

      const created = await temporaryMetadataService.create(createDto);
      
      // Then update it
      const updateDto = {
        fields_encrypted: ['field1', 'field2', 'field3'],
        encrypted_file_path: '/path/to/updated/file3',
      };

      const result = await temporaryMetadataService.update(created.data_id, updateDto);

      expect(result).toBeDefined();
      expect(result.data_id).toBe(created.data_id);
      expect(result.fields_encrypted).toEqual(updateDto.fields_encrypted);
      expect(result.encrypted_file_path).toBe(updateDto.encrypted_file_path);
    });
  });

  describe('FileParserService', () => {
    beforeEach(() => {
      // Create test files
      const testDir = path.join(process.cwd(), 'test-files');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Create JSON test file
      const jsonData = { name: 'John Doe', email: 'john@example.com', ssn: '123-45-6789' };
      fs.writeFileSync(path.join(testDir, 'test.json'), JSON.stringify(jsonData));

      // Create CSV test file
      const csvData = 'name,email,ssn\nJohn Doe,john@example.com,123-45-6789';
      fs.writeFileSync(path.join(testDir, 'test.csv'), csvData);

      // Create text test file
      const textData = 'This is a test file with some sensitive information: 123-45-6789';
      fs.writeFileSync(path.join(testDir, 'test.txt'), textData);
    });

    afterEach(() => {
      // Clean up test files
      const testDir = path.join(process.cwd(), 'test-files');
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should parse a JSON file', async () => {
      const filePath = path.join(process.cwd(), 'test-files', 'test.json');
      const result = await fileParserService.parseFile(filePath, DataFormat.JSON);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
      expect(result.data.ssn).toBe('123-45-6789');
      expect(result.availableFields).toContain('name');
      expect(result.availableFields).toContain('email');
      expect(result.availableFields).toContain('ssn');
    });

    it('should parse a CSV file', async () => {
      const filePath = path.join(process.cwd(), 'test-files', 'test.csv');
      const result = await fileParserService.parseFile(filePath, DataFormat.CSV);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0].name).toBe('John Doe');
      expect(result.data[0].email).toBe('john@example.com');
      expect(result.data[0].ssn).toBe('123-45-6789');
      expect(result.availableFields).toContain('name');
      expect(result.availableFields).toContain('email');
      expect(result.availableFields).toContain('ssn');
    });

    it('should parse a text file', async () => {
      const filePath = path.join(process.cwd(), 'test-files', 'test.txt');
      const result = await fileParserService.parseFile(filePath, DataFormat.TEXT);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('sensitive information');
      expect(result.availableFields).toContain('content');
    });
  });

  describe('StorageService', () => {
    beforeEach(() => {
      // Create test directories
      const testDirs = [
        path.join(process.cwd(), 'uploads', 'aws_s3'),
        path.join(process.cwd(), 'uploads', 'azure_blob'),
        path.join(process.cwd(), 'uploads', 'on_premises'),
      ];

      testDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });
    });

    afterEach(() => {
      // Clean up test directories
      const testDirs = [
        path.join(process.cwd(), 'uploads', 'aws_s3'),
        path.join(process.cwd(), 'uploads', 'azure_blob'),
        path.join(process.cwd(), 'uploads', 'on_premises'),
      ];

      testDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      });
    });

    it('should store data in AWS S3 (simulated)', async () => {
      const data = 'Test data for AWS S3';
      const fileName = 'test-aws-s3.txt';
      const storageConfig = { bucket: 'test-bucket' };
      const userId = 'test-user-id';

      const result = await storageService.storeData(
        data,
        fileName,
        StorageType.AWS_S3,
        storageConfig,
        userId,
      );

      expect(result).toBeDefined();
      expect(result.storage_path).toBeDefined();
      expect(result.storage_path).toContain('s3://');
      expect(result.storage_path).toContain(fileName);
      expect(result.storage_type).toBe(StorageType.AWS_S3);

      // Check if file was created in the simulated location
      const localPath = path.join(process.cwd(), 'uploads', 'aws_s3', userId, fileName);
      expect(fs.existsSync(localPath)).toBe(true);
      expect(fs.readFileSync(localPath, 'utf8')).toBe(data);
    });

    it('should store data in Azure Blob Storage (simulated)', async () => {
      const data = 'Test data for Azure Blob Storage';
      const fileName = 'test-azure-blob.txt';
      const storageConfig = { container: 'test-container', account: 'test-account' };
      const userId = 'test-user-id';

      const result = await storageService.storeData(
        data,
        fileName,
        StorageType.AZURE_BLOB,
        storageConfig,
        userId,
      );

      expect(result).toBeDefined();
      expect(result.storage_path).toBeDefined();
      expect(result.storage_path).toContain('azure://');
      expect(result.storage_path).toContain(fileName);
      expect(result.storage_type).toBe(StorageType.AZURE_BLOB);

      // Check if file was created in the simulated location
      const localPath = path.join(process.cwd(), 'uploads', 'azure_blob', userId, fileName);
      expect(fs.existsSync(localPath)).toBe(true);
      expect(fs.readFileSync(localPath, 'utf8')).toBe(data);
    });

    it('should store data on-premises', async () => {
      const data = 'Test data for on-premises storage';
      const fileName = 'test-on-premises.txt';
      const storageConfig = { path: 'uploads/on_premises' };
      const userId = 'test-user-id';

      const result = await storageService.storeData(
        data,
        fileName,
        StorageType.ON_PREMISES,
        storageConfig,
        userId,
      );

      expect(result).toBeDefined();
      expect(result.storage_path).toBeDefined();
      expect(result.storage_path).toContain('file://');
      expect(result.storage_path).toContain(fileName);
      expect(result.storage_type).toBe(StorageType.ON_PREMISES);

      // Check if file was created in the specified location
      const localPath = path.join(process.cwd(), storageConfig.path, userId, fileName);
      expect(fs.existsSync(localPath)).toBe(true);
      expect(fs.readFileSync(localPath, 'utf8')).toBe(data);
    });
  });

  describe('SelfDestructScriptGenerator', () => {
    it('should generate a Windows self-destruct script', () => {
      const options = {
        triggerCondition: 'not exist "C:\\approved.txt"',
        filePattern: 'C:\\sensitive\\*.txt',
        logEndpoint: 'https://api.example.com/log-breach',
      };

      const script = selfDestructScriptGenerator.generateScript('windows', options);

      expect(script).toBeDefined();
      expect(typeof script).toBe('string');
      expect(script).toContain('@echo off');
      expect(script).toContain(options.triggerCondition);
      expect(script).toContain(options.filePattern);
      expect(script).toContain(options.logEndpoint);
    });

    it('should generate a Linux self-destruct script', () => {
      const options = {
        triggerCondition: '[ ! -f "/approved.txt" ]',
        filePattern: '/sensitive/*.txt',
        logEndpoint: 'https://api.example.com/log-breach',
      };

      const script = selfDestructScriptGenerator.generateScript('linux', options);

      expect(script).toBeDefined();
      expect(typeof script).toBe('string');
      expect(script).toContain('#!/bin/bash');
      expect(script).toContain(options.triggerCondition);
      expect(script).toContain(options.filePattern);
      expect(script).toContain(options.logEndpoint);
    });

    it('should generate a JavaScript self-destruct script', () => {
      const options = {
        triggerCondition: '!window.isApproved',
        filePattern: 'sensitive.json',
        logEndpoint: 'https://api.example.com/log-breach',
      };

      const script = selfDestructScriptGenerator.generateJavaScriptScript(options);

      expect(script).toBeDefined();
      expect(typeof script).toBe('string');
      expect(script).toContain('// Self-destruct script');
      expect(script).toContain(options.triggerCondition);
      expect(script).toContain(options.filePattern);
      expect(script).toContain(options.logEndpoint);
    });

    it('should embed a script in a text file', () => {
      const fileContent = 'This is a test file with sensitive information';
      const script = '// Self-destruct script';

      const result = selfDestructScriptGenerator.embedScriptInFile(fileContent, script);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain(fileContent);
      expect(result).toContain(script);
    });

    it('should embed a script in a binary file', () => {
      const fileContent = Buffer.from('Binary file content');
      const script = '// Self-destruct script';

      const result = selfDestructScriptGenerator.embedScriptInFile(fileContent, script);

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.includes(fileContent)).toBe(true);
      expect(result.toString()).toContain(script);
    });
  });
});
