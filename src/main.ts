import 'dotenv/config';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('HTTP');
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const timestamp = new Date().toISOString();
      logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms - ${timestamp}`,
      );
    });
    next();
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payment Events API')
    .setDescription('API de pagamentos fake com eventos de disparo de e-mail e recibo anexo')
    .setVersion('1.0')
    .setContact('Natan Oliveira', '', 'natanoliveirati@gmail.com')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);
  const port = process.env.PORT ? Number(process.env.PORT) : 4002;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
