import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}
