import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Origenes permitidos, separados por coma en `CORS_ORIGINS`.
 *
 * ```
 * CORS_ORIGINS=https://smart-store.com,https://admin.smart-store.com
 * ```
 *
 * Si la variable está vacía se permite cualquier origen (`*`), cómodo en
 * desarrollo pero no recomendado en producción.
 */
function parseOrigins(raw?: string): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function buildCorsOptions(raw = process.env.CORS_ORIGINS): CorsOptions {
  const origins = parseOrigins(raw);

  return {
    // sin lista configurada: abierto. Con lista: solo esos dominios.
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // el auth viaja por header `Authorization`, no por cookie. Si algún día se
    // pasa a cookies, poner `credentials: true` y sacar el `'*'` de arriba:
    // el navegador rechaza el comodín cuando se mandan credenciales.
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
