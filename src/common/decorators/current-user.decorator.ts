import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Inyecta el usuario autenticado en el handler:
 *
 *   @Get('me')
 *   me(@CurrentUser() user: User) { ... }
 *   me(@CurrentUser('id') userId: string) { ... }
 *
 * Lo carga JwtStrategy.validate() en cada request.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
