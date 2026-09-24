import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Normaliza la lista de `CORS_ORIGINS`.
 *
 * El navegador manda el header `Origin` como `esquema://host[:puerto]`, sin
 * path ni barra final. Por eso acá se saca la barra y se descartan las
 * entradas sin esquema: nunca podrían matchear, y si se dejan pasan como
 * entradas muertas que hacen parecer que CORS "no anda".
 */
function parseOrigins(raw?: string): string[] {
  const entries = (raw ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const [valid, invalid] = [
    entries.filter((origin) => /^https?:\/\/.+/.test(origin)),
    entries.filter((origin) => !/^https?:\/\/.+/.test(origin)),
  ];

  return valid;
}

export function buildCorsOptions(raw = process.env.CORS_ORIGINS): CorsOptions {
  const origins = parseOrigins(raw);

  return {
    origin: "*",
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
  const origins = options.origin as string[];
  app.enableCors(options);
  return origins;
}
