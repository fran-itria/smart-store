import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

/**
 * Referencia a una opción de variante. Se acepta de dos formas, hay que mandar
 * una u otra:
 *  - `variantId`: la variante ya existe (el admin la eligió de la lista).
 *  - `name` + `value`: se resuelve por find-or-create. Útil para cargas
 *    masivas o para dar de alta opciones nuevas sin un paso previo.
 */
export class VariantRefDto {
  @ValidateIf((o: VariantRefDto) => !o.name && !o.value)
  @IsUUID('4', { message: 'Mandá variantId, o name + value' })
  variantId?: string;

  @ValidateIf((o: VariantRefDto) => !o.variantId)
  @IsString()
  @Length(1, 80)
  name?: string;

  @ValidateIf((o: VariantRefDto) => !o.variantId)
  @IsString()
  @Length(1, 120)
  value?: string;
}

/**
 * Asocia a un SKU la combinación de variantes que lo identifica.
 *
 * Va en bloque y no de a una porque la combinación es lo que define al SKU:
 * "Talle M + Color Rojo" es una unidad. El service la reemplaza entera y
 * verifica que no haya dos opciones de la misma dimensión ni otro SKU del
 * mismo producto con la misma combinación.
 */
export class SkuVariantDto {
  @IsUUID('4')
  skuId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantRefDto)
  variants!: VariantRefDto[];
}
