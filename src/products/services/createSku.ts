import { EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Sku } from '../sku/entities/sku.entity';
import { SkuService } from '../sku/sku.service';
import { ProductDto, VariantCombinationDto } from '../dto/product.dto';
import { assertPriceIsValid } from './assertPriceIsValid';
import { buildCode } from './buildCode';
import { resolveSkuState, skuStateCodeParts } from './skuKey';

/**
 * Crea el SKU de una combinación. Precio y stock salen de la combinación y,
 * si no los trae, del producto: el default cubre el caso común de "todas las
 * variantes valen lo mismo". Igual con condición y batería.
 */
export async function createSku(
  product: Product,
  combination: Omit<VariantCombinationDto, 'variant'>,
  values: string[],
  body: ProductDto,
  manager: EntityManager,
  skuService: SkuService,
): Promise<Sku> {
  const price = combination.price ?? body.price;
  const discountedPrice = combination.discountedPrice ?? body.discountedPrice;

  assertPriceIsValid(price, discountedPrice, values.join('/') || product.name);

  const state = resolveSkuState(combination, body);

  return skuService.create(
    {
      productId: product.id,
      code: await buildCode(
        product,
        // El estado va en el código: dos "Negro" usados con distinta batería
        // necesitan códigos distintos
        [...values, ...skuStateCodeParts(state)],
        combination.code,
        manager,
        skuService,
      ),
      price,
      discountedPrice,
      stock: combination.stock ?? body.stock ?? 0,
      condition: state.condition,
      battery: state.battery,
    },
    manager,
  );
}
