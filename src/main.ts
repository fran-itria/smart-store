import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger';

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

  const port = process.env.PORT ?? 3000;
  const docsUrl =
    process.env.SWAGGER_ENABLED === 'false' ? null : setupSwagger(app, port);

  await app.listen(port);
  console.log('Corriendo en puerto:', port);
  if (docsUrl) console.log('Documentación en:', docsUrl);
}
bootstrap();
