import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataFormat } from '../dto/temporary-metadata.dto';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import * as xml2js from 'xml2js';

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  /**
   * Parse file data based on format and extract available fields
   * @param filePath Path to the uploaded file
   * @param format Format of the file
   * @returns Object with parsed data and available fields
   */
  async parseFile(filePath: string, format: DataFormat): Promise<{ 
    data: any; 
    availableFields: string[];
  }> {
    try {
      switch (format) {
        case DataFormat.JSON:
          return await this.parseJsonFile(filePath);
        case DataFormat.CSV:
          return await this.parseCsvFile(filePath);
        case DataFormat.XML:
          return await this.parseXmlFile(filePath);
        case DataFormat.TEXT:
          return await this.parseTextFile(filePath);
        case DataFormat.BINARY:
          return await this.parseBinaryFile(filePath);
        case DataFormat.PARQUET:
        case DataFormat.AVRO:
        case DataFormat.CUSTOM:
          throw new BadRequestException(`Format ${format} requires specialized parsing libraries`);
        default:
          throw new BadRequestException(`Unsupported format: ${format}`);
      }
    } catch (error) {
      this.logger.error(`Error parsing file: ${error.message}`);
      throw new BadRequestException(`Failed to parse file: ${error.message}`);
    }
  }

  /**
   * Parse JSON file and extract available fields
   */
  private async parseJsonFile(filePath: string): Promise<{ data: any; availableFields: string[] }> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Extract available fields
      const availableFields = this.extractJsonFields(data);
      
      return { data, availableFields };
    } catch (error) {
      this.logger.error(`Error parsing JSON file: ${error.message}`);
      throw new BadRequestException(`Invalid JSON file: ${error.message}`);
    }
  }

  /**
   * Parse CSV file and extract available fields
   */
  private async parseCsvFile(filePath: string): Promise<{ data: any[]; availableFields: string[] }> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const availableFields: string[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          headers.forEach(header => availableFields.push(header));
        })
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve({ data: results, availableFields });
        })
        .on('error', (error) => {
          this.logger.error(`Error parsing CSV file: ${error.message}`);
          reject(new BadRequestException(`Invalid CSV file: ${error.message}`));
        });
    });
  }

  /**
   * Parse XML file and extract available fields
   */
  private async parseXmlFile(filePath: string): Promise<{ data: any; availableFields: string[] }> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const parser = new xml2js.Parser({ explicitArray: false });
      const parseString = promisify(parser.parseString);
      const data = await parseString(fileContent);
      
      // Extract available fields
      const availableFields = this.extractXmlFields(data);
      
      return { data, availableFields };
    } catch (error) {
      this.logger.error(`Error parsing XML file: ${error.message}`);
      throw new BadRequestException(`Invalid XML file: ${error.message}`);
    }
  }

  /**
   * Parse text file and extract available fields (limited functionality)
   */
  private async parseTextFile(filePath: string): Promise<{ data: any; availableFields: string[] }> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      
      // For text files, we can't reliably extract fields
      // We'll treat each line as a field for simplicity
      const lines = fileContent.split('\n').filter(line => line.trim() !== '');
      const data = { lines };
      const availableFields = ['content'];
      
      return { data, availableFields };
    } catch (error) {
      this.logger.error(`Error parsing text file: ${error.message}`);
      throw new BadRequestException(`Invalid text file: ${error.message}`);
    }
  }

  /**
   * Parse binary file (limited functionality)
   */
  private async parseBinaryFile(filePath: string): Promise<{ data: any; availableFields: string[] }> {
    try {
      // For binary files, we can't extract fields
      // We'll just return the file path and metadata
      const stats = await fs.promises.stat(filePath);
      const data = { 
        filePath,
        size: stats.size,
        binary: true
      };
      
      // For binary files, we can only encrypt the whole file
      const availableFields = ['content'];
      
      return { data, availableFields };
    } catch (error) {
      this.logger.error(`Error parsing binary file: ${error.message}`);
      throw new BadRequestException(`Invalid binary file: ${error.message}`);
    }
  }

  /**
   * Extract fields from JSON data recursively
   */
  private extractJsonFields(data: any, prefix = '', result: string[] = []): string[] {
    if (data === null || data === undefined) {
      return result;
    }
    
    if (Array.isArray(data)) {
      // For arrays, we'll check the first item to extract fields
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        this.extractJsonFields(data[0], prefix, result);
      } else {
        // For arrays of primitives, we'll just add the array itself as a field
        result.push(prefix);
      }
    } else if (typeof data === 'object') {
      // For objects, we'll extract each field
      for (const key of Object.keys(data)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        
        if (typeof data[key] === 'object' && data[key] !== null) {
          this.extractJsonFields(data[key], newPrefix, result);
        } else {
          result.push(newPrefix);
        }
      }
    } else {
      // For primitives, we'll just add the field itself
      result.push(prefix);
    }
    
    return result;
  }

  /**
   * Extract fields from XML data recursively
   */
  private extractXmlFields(data: any, prefix = '', result: string[] = []): string[] {
    if (data === null || data === undefined) {
      return result;
    }
    
    if (typeof data === 'object') {
      for (const key of Object.keys(data)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          this.extractXmlFields(data[key], newPrefix, result);
        } else {
          result.push(newPrefix);
        }
      }
    } else {
      result.push(prefix);
    }
    
    return result;
  }

  /**
   * Get value from nested object using dot notation
   */
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj);
  }

  /**
   * Set value in nested object using dot notation
   */
  setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop();
    
    const target = parts.reduce((prev, curr) => {
      if (!prev[curr]) prev[curr] = {};
      return prev[curr];
    }, obj);
    
    target[last] = value;
  }
}
