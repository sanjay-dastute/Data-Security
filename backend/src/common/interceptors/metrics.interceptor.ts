import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || '';
    
    // Log the request
    console.log(`[${method}] ${url} - ${userAgent}`);
    
    const now = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (val) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          
          // Log the response
          console.log(`[${method}] ${url} - ${response.statusCode} - ${delay}ms`);
        },
        error: (err) => {
          const delay = Date.now() - now;
          
          // Log the error
          console.error(`[${method}] ${url} - ${err.status || 500} - ${delay}ms - ${err.message}`);
        },
      }),
    );
  }
}
