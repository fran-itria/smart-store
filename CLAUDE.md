# CLAUDE.md

Guía para trabajar en este repositorio.

## Qué es este proyecto

`smart-store` es una API backend en **NestJS 11 + TypeScript**, pensada para
correr sobre **PostgreSQL vía TypeORM**. Hoy está en estado de *scaffold*: la
infraestructura base (config, DB, scheduler) está cableada, pero todavía no hay
módulos de dominio (productos, stock, ventas, etc.). El único endpoint que
existe es el `GET /` de ejemplo que devuelve `Hello World!`.

Historial: un solo commit (`Create proyect`). El trabajo real arranca acá.

## Comandos

Gestor de paquetes: **pnpm** (existe `pnpm-lock.yaml`).

```bash
pnpm install
pnpm start:dev      # nest start --watch
pnpm start          # nest start
pnpm build          # nest build -> dist/
pnpm start:prod     # node dist/main
pnpm test           # jest, *.spec.ts dentro de src/
pnpm test:e2e       # jest --config ./test/jest-e2e.json
pnpm test:cov       # cobertura -> ./coverage
pnpm lint           # eslint --fix sobre src, apps, libs, test
pnpm format         # prettier --write
```

## Arquitectura

```
src/
  main.ts              bootstrap; carga .env con process.loadEnvFile() y escucha en PORT (default 3000)
  app.module.ts        módulo raíz: ConfigModule global + ScheduleModule + databaseImports + domainModules
  app.controller.ts    GET / de ejemplo
  app.service.ts       getHello()
  config/
    database.ts        exporta databaseImports: TypeOrmModule.forRootAsync configurado por ConfigService
    swagger.ts         setupSwagger(): monta Swagger UI en /docs y el JSON en /docs/json
```

Puntos de extensión que ya existen y hay que usar al agregar features:

- **`domainModules` en `src/app.module.ts`**: array donde se registran los
  módulos de negocio. Está vacío y se resuelve a `[]` cuando
  `NODE_ENV === 'test'`, para que los tests no levanten el dominio completo.
- **`databaseImports` en `src/config/database.ts`**: también se resuelve a `[]`
  cuando `NODE_ENV === 'test'`, así los tests no necesitan una base real.
  Usa `autoLoadEntities: true`, por lo que **no hay que listar entidades a mano**:
  alcanza con registrarlas con `TypeOrmModule.forFeature([...])` en su módulo.
- **`ScheduleModule.forRoot()`** ya está activo: los cron jobs (`@Cron`,
  `@Interval`) funcionan sin configuración extra.

## Variables de entorno

`.env` está gitignoreado (no versionar). Claves que el código lee:

| Variable | Default | Uso |
| --- | --- | --- |
| `PORT` | `3000` | puerto HTTP |
| `DB_HOST` | `localhost` | host Postgres |
| `DB_PORT` | `5432` | puerto Postgres |
| `DB_USERNAME` | `postgres` | usuario |
| `DB_PASSWORD` | `postgres` | password |
| `DB_DATABASE` | `smart_store` | nombre de la base |
| `DB_SYNCHRONIZE` | `true` | string, se compara contra `'true'` |
| `SWAGGER_ENABLED` | (vacío) | `'false'` apaga la doc en `/docs` |

`NODE_ENV=test` desactiva TypeORM y los módulos de dominio (ver arriba).

Hay una línea comentada para `DATABASE_URL` en `src/config/database.ts`: si se
pasa a conexión por URL, mantener también el fallback por campos sueltos.

## Estado pendiente / trampas conocidas

- **`DB_SYNCHRONIZE` default `true`**: cómodo en desarrollo, peligroso en
  producción (altera el esquema solo). Migrar a migraciones antes de deploy.
- **`DB_DATABASE` default `monastudio`**: default heredado de otro proyecto, no
  coincide con `smart-store`. Revisarlo al definir el entorno real.
- **`README.md` es el genérico de NestJS**, no describe este proyecto.
- **No hay `ValidationPipe` global** en `main.ts`. Al agregar DTOs, sumar
  `class-validator` / `class-transformer` y registrar el pipe.
- El `try/catch` vacío alrededor de `process.loadEnvFile()` en `main.ts` es
  intencional: permite correr sin `.env` (por ejemplo en CI).
- `dist/` está commiteado en el árbol de trabajo pero gitignoreado; no editarlo.

## Convenciones de código

- Prettier: comillas simples, trailing commas (`.prettierrc`).
- ESLint plano (`eslint.config.mjs`) con `typescript-eslint` + Prettier.
- TypeScript: `module: nodenext`, `target: ES2023`, decoradores habilitados.
  Ojo: `strictNullChecks: true` pero `noImplicitAny: false`.
- Estructura esperada por feature (patrón estándar de Nest):
  `src/<feature>/` con `<feature>.module.ts`, `.controller.ts`, `.service.ts`,
  `entities/`, `dto/`.
- Tests unitarios: `*.spec.ts` junto al código en `src/`. E2E: `test/*.e2e-spec.ts`.