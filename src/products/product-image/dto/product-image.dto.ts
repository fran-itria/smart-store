import { IsInt, IsOptional, IsUUID, IsUrl, Min } from 'class-validator';

/**
 * Alta de una imagen.
 *
 * Siempre cuelga de un producto. `skuId` es lo que decide qué es:
 * con valor, es la foto de esa variante puntual (la remera roja) y el front la
 * muestra al seleccionarla; sin valor, es una imagen general del producto.
 */
export class ProductImageDto {
  @IsUUID('4')
  productId!: string;

  /** Opcional: si va, el SKU tiene que pertenecer a `productId`. */
  @IsOptional()
  @IsUUID('4')
  skuId?: string;

  @IsUrl(
    { require_tld: false },
    { message: 'La url de la imagen no es válida' },
  )
  url!: string;

  /** Orden dentro del producto, menor primero. Si se omite, va al final. */
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
