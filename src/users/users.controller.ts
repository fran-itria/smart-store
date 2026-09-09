import { Controller, Get, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BEARER_AUTH } from '../config/swagger';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth(BEARER_AUTH)
@Controller('/users')
export class UsersController {
  constructor(private readonly users_services: UsersService) {}

  /** Listado completo de usuarios. */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiOkResponse({ description: 'Todos los usuarios.' })
  @ApiForbiddenResponse({ description: 'Hace falta rol admin.' })
  async getAllUsers(@Res() res: Response) {
    const users = await this.users_services.findAllUsers();
    res.status(200).json(users);
  }
}
