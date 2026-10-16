import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module.js';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Security & Performance Middlewares
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      contentSecurityPolicy: false, // Ensures Swagger UI assets load cleanly
    }),
  );
  app.use(compression());

  // Cross-Origin Resource Sharing (Web & Mobile clients)
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // API Versioning Prefix (/api/v1)
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe (Strict mobile-first DTO contract enforcement)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Response Envelope & Exception Interceptors
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // OpenAPI / Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('AtoZ E-Commerce Enterprise API')
    .setDescription(
      'High-performance RESTful API powering Next.js web application and native Mobile apps. ' +
        'Supports catalog indexing for 20,000+ products, real-time inventory locking, and Visa/PayPal transactions.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your Bearer Access Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('System & Health', 'Health checks and server runtime status')
    .addTag('Auth', 'Authentication, JWT tokens, mobile session handling')
    .addTag('Products', 'High-performance catalog, filtering, and 20k+ product search')
    .addTag('Categories', 'Hierarchical category taxonomy')
    .addTag('Cart', 'Persistent and guest shopping cart operations')
    .addTag('Orders', 'Order checkout with atomic stock locking')
    .addTag('Payments', 'Stripe, Visa, PayPal gateways and idempotent webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'AtoZ E-Commerce API Docs',
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 AtoZ Server running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

await bootstrap();
