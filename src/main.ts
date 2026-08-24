import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

try {
  process.loadEnvFile();
} catch (error) {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta props que el DTO no declara
      forbidNonWhitelisted: true, // y si llegan, responde 400
      transform: true, // instancia el DTO y castea tipos primitivos
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log('Correindo en puerto:', process.env.PORT);
}
bootstrap();
