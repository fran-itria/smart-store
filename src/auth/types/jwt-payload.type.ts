import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  /** id del usuario */
  sub: string;
  email: string;
  role: UserRole;
}
