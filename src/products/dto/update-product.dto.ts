import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ProductDto, VariantCombinationDto } from './product.dto';

export class UpdateVariantCombinationDto extends VariantCombinationDto {
  /**
   * SKU existente que pasa a ser esta combinación. Hace falta sólo para
   * cambiarle las opciones sin perder el SKU (renombrar "Rojo" a "Bordó"):
   * si no va, el SKU se busca por sus opciones y, si no hay ninguno con
   * esas, se crea uno nuevo.
   */
  @IsOptional()
  @IsUUID('4')
  skuId?: string;
}

/**
 * Edición completa de un producto (`PUT /products/:id`). Misma forma que el
 * alta, con estas reglas:
 *
 *  - `variants` / `components` son la lista *entera*: los SKUs que no
 *    aparezcan se dan de baja, igual que los componentes que no vengan
 *  - lo opcional que no se manda queda como está: `description`,
 *    `isPublished`, `categoryIds`, `images`, `stock`, `code` y
 *    `discountedPrice`
 *  - `null` borra `description` / `discountedPrice`; `[]` vacía
 *    `categoryIds` / `images`
 */
export class UpdateProductDto extends ProductDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantCombinationDto)
  declare variants?: UpdateVariantCombinationDto[];
}
