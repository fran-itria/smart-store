import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @Length(2, 120)
  name!: string;

  @IsString()
  @Length(2, 120)
  surname!: string;

  @IsOptional()
  @Length(2, 120)
  user!: string;

  @IsOptional()
  @Length(2, 120)
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contrasñea debe ser menor a 72 caracteres' })
  password!: string;
}
