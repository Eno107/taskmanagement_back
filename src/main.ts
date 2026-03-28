import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('Real-time task management application API')
    .setVersion('1.0')
    .build();

  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Swagger documentation
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`📚 Swagger documentation is available at /api/docs`);
  logger.log(`🔥 Server is running on port ${process.env.PORT ?? 3000}`);
}

void bootstrap();
