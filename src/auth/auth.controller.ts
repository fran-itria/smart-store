import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BEARER_AUTH } from '../config/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Crea una cuenta y devuelve el token. Arranca con rol `user`. */
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registro' })
  @ApiCreatedResponse({ description: 'Usuario creado y `access_token`.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** Devuelve el `access_token` que va en **Authorize**. */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ description: 'Usuario y `access_token`.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Endpoint protegido de referencia: requiere Bearer token. */
  @Get('me')
  @ApiBearerAuth(BEARER_AUTH)
  @ApiOperation({ summary: 'Usuario actual' })
  @ApiUnauthorizedResponse({ description: 'Falta el token o venció.' })
  me(@CurrentUser() user: User) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
