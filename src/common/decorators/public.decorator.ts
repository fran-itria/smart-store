import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint (o un controller entero) como abierto.
 *
 * El JwtAuthGuard está registrado como guard global, así que todo pide token
 * salvo lo que lleve este decorador.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
