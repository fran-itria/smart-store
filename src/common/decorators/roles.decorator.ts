import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint a ciertos roles: `@Roles(UserRole.ADMIN)`.
 * Requiere que RolesGuard esté activo (lo está, es global).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
