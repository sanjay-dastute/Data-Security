import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { BreachDetectionFilter } from './common/filters/breach-detection.filter';
import { BlockchainService } from './encryption/services/blockchain.service';

async function bootstrap() {
  // Check if TLS certificates exist for HTTPS
  const configService = new ConfigService();
  const useHttps = configService.get('USE_HTTPS') === 'true';
  
  let httpsOptions = undefined;
  
  if (useHttps) {
    try {
      const keyPath = configService.get('SSL_KEY_PATH') || path.resolve(__dirname, '../ssl/private-key.pem');
      const certPath = configService.get('SSL_CERT_PATH') || path.resolve(__dirname, '../ssl/public-certificate.pem');
      
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        console.log('HTTPS enabled with TLS 1.3');
      } else {
        console.warn('SSL certificates not found. Falling back to HTTP.');
      }
    } catch (error) {
      console.error('Error loading SSL certificates:', error.message);
      console.warn('Falling back to HTTP.');
    }
  }
  
  // Create app with HTTPS if certificates are available
  const app = await NestFactory.create(AppModule, { httpsOptions });
  
  // Enable security headers with Helmet
  app.use(helmet());
  
  // Configure TLS 1.3 only if using HTTPS
  if (httpsOptions) {
    app.use((req, res, next) => {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      next();
    });
  }
  
  // Enable CORS with secure configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGINS') || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,X-API-Key,X-Org-API-Key,X-Client-MAC',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Apply rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
  );
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Apply global interceptors
  app.useGlobalInterceptors(
    new SanitizeInterceptor(),
    new LoggingInterceptor(app.get(BlockchainService)),
  );
  
  // Apply global filters
  app.useGlobalFilters(
    new BreachDetectionFilter(app.get(BlockchainService)),
  );
  
  // Compression - temporarily disabled
  // app.use(compression());
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('QuantumTrust Data Security API')
    .setDescription('API documentation for QuantumTrust Data Security')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addApiKey({ type: 'apiKey', name: 'X-Org-API-Key', in: 'header' }, 'org-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Get port from environment or use default
  const port = configService.get('PORT') || 8000;
  await app.listen(port);
  console.log(`Application is running on: ${useHttps ? 'https' : 'http'}://localhost:${port}`);
}

bootstrap();
