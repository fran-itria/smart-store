import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

/**
 * Alta de un SKU: la unidad vendible.
 *
 * Es lo que después viaja en la orden, así que acá viven precio y stock.
 * Sus variantes no se mandan en este payload: se asocian en un segundo paso
 * contra el endpoint de sku-variant, una vez que el SKU tiene id.
 */
export class SkuDto {
  /** Producto al que pertenece. Tiene que existir. */
  @IsUUID('4')
  productId!: string;

  /** Código interno / de barras. Único entre los SKUs vivos. */
  @IsString()
  @Length(1, 64)
  code!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price!: number;

  /** Precio promocional vigente. Debe ser menor a `price` (lo valida el service). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  discountedPrice?: number;

  /** En un SKU bundle el stock real lo limitan sus componentes. */
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
