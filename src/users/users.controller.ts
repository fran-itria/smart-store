import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('/users')
export class UsersController {
  constructor(private readonly users_services: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Res() res: Response) {
    const users = await this.users_services.findAllUsers();
    res.status(200).json(users);
  }
}
