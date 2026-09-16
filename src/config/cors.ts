import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

function parseOrigins(raw?: string): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function buildCorsOptions(raw = process.env.CORS_ORIGINS): CorsOptions {
  const origins = parseOrigins(raw);

  return {
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400, // cachea el preflight 24h
  };
}

/**
 * Habilita CORS en la app. Se llama antes de `listen()`.
 */
export function setupCors(app: INestApplication) {
  const options = buildCorsOptions();
  app.enableCors(options);
  return options.origin;
}
