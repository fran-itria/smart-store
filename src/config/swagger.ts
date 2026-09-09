import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Nombre del esquema de seguridad. Tiene que coincidir con @ApiBearerAuth(). */
export const BEARER_AUTH = 'access-token';

/**
 * Monta la documentación interactiva en `/docs`.
 *
 * Swagger se sirve como middleware, no como handler de Nest: los guards
 * globales no lo tapan, así que cualquiera que llegue al puerto ve la doc.
 * Por eso se puede apagar con `SWAGGER_ENABLED=false` en producción.
 *
 * Los schemas salen del plugin `@nestjs/swagger` configurado en
 * `nest-cli.json`: lee los tipos, los decoradores de class-validator y el
 * JSDoc de cada propiedad, así que los DTOs no necesitan `@ApiProperty`.
 */
export function setupSwagger(app: INestApplication, port: number | string) {
  const config = new DocumentBuilder()
    .setTitle('smart-store API')
    .setDescription(
      [
        'Backend de catálogo y ventas.',
        '',
        'Para probar los endpoints protegidos: `POST /auth/register` o',
        '`POST /auth/login`, copiá el `access_token` de la respuesta y pegalo',
        'en **Authorize** (arriba a la derecha). El alta de productos además',
        'pide rol `admin`.',
      ].join('\n'),
    )
    .setVersion('0.0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      BEARER_AUTH,
    )
    .addTag('auth', 'Registro, login y usuario actual')
    .addTag('products', 'Catálogo: productos simples, variables y combos')
    .addTag('users', 'Usuarios')
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      jsonDocumentUrl: 'docs/json',
      swaggerOptions: {
        // el token sobrevive al refresh de la página
        persistAuthorization: true,
        docExpansion: 'none',
      },
    },
  );

  return `http://localhost:${port}/docs`;
}
