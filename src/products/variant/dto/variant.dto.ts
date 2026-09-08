import { IsString, Length } from 'class-validator';

export class VariantDto {
  /** Dimensión: "Talle", "Color", "Sabor". */
  @IsString()
  @Length(1, 80)
  name!: string;

  /** Opción concreta: "M", "Rojo", "Vainilla". */
  @IsString()
  @Length(1, 120)
  value!: string;
}
