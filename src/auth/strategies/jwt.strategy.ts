import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    // Sin secreto no hay arranque: mejor romper acá que firmar tokens
    // con un default previsible.
    if (!secret) {
      throw new Error('Falta la variable de entorno JWT_SECRET');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Lo que devuelve acá queda en `request.user` (lo lee @CurrentUser()).
   * Se relee el usuario en cada request para que un baneo o un cambio de rol
   * pegue al instante, sin esperar a que expire el token.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario inválido o inactivo');
    }

    return user;
  }
}
