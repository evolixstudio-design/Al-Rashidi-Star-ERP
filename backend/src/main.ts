import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HinglishExceptionFilter } from './common/filters/hinglish-exception.filter.js';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Enable CORS for frontend Vite dev server (usually localhost:5173)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Increase body limit for data import
  const express = await import('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global API route prefix
  app.setGlobalPrefix('api');

  // Hinglish exception filter for senior-friendly errors
  app.useGlobalFilters(new HinglishExceptionFilter());

  // Idempotency interceptor to prevent accidental double clicks
  app.useGlobalInterceptors(new IdempotencyInterceptor());

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend server running on http://0.0.0.0:${port}/api`);
}

bootstrap();
