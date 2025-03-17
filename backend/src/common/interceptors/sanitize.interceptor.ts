import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Sanitize request body
    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }
    
    // Sanitize request query
    if (request.query) {
      request.query = this.sanitizeObject(request.query);
    }
    
    // Sanitize request params
    if (request.params) {
      request.params = this.sanitizeObject(request.params);
    }
    
    return next.handle();
  }
  
  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitizedObj = {};
      
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = this.sanitizeObject(obj[key]);
        }
      }
      
      return sanitizedObj;
    }
    
    return obj;
  }
  
  private sanitizeString(str: string): string {
    // Skip sanitization for encrypted data or base64 encoded content
    if (this.isBase64(str) || this.isEncryptedData(str)) {
      return str;
    }
    
    return sanitizeHtml(str, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'recursiveEscape',
    });
  }
  
  private isBase64(str: string): boolean {
    try {
      // Check if the string is base64 encoded
      const regex = /^[A-Za-z0-9+/=]+$/;
      return regex.test(str) && str.length % 4 === 0;
    } catch (error) {
      return false;
    }
  }
  
  private isEncryptedData(str: string): boolean {
    // Check if the string appears to be encrypted data
    // This is a simplified check and may need to be adjusted based on your encryption format
    try {
      const regex = /^[A-Za-z0-9+/=]{32,}$/;
      return regex.test(str);
    } catch (error) {
      return false;
    }
  }
}
