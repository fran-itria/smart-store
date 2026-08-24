import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const databaseImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const rawPort = configService.get<string>('DB_PORT', '5432');
            return {
              type: 'postgres',
              // url: configService.get<string>('DATABASE_URL'),
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: Number(rawPort),
              username: configService.get<string>('DB_USERNAME', 'postgres'),
              password: configService.get<string>('DB_PASSWORD', 'postgres'),
              database: configService.get<string>('DB_DATABASE', 'smart_store'),
              autoLoadEntities: true,
              synchronize:
                configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
            };
          },
        }),
      ];
