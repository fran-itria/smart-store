import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 120 })
  surname!: string;

  @Column({ type: 'varchar', length: 20 })
  user!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
