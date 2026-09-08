import { EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Sku } from '../sku/entities/sku.entity';
import { Variant } from '../variant/entities/variant.entity';
import { VariantService } from '../variant/variant.service';
import { SkuService } from '../sku/sku.service';
import { SkuVariantService } from '../sku-variant/sku-variant.service';
import { ProductDto, VariantCombinationDto } from '../dto/product.dto';
import { createSku } from './createSku';

/** Los services que necesita el alta para escribir el árbol de un producto. */
export interface ProductWriteServices {
  variantService: VariantService;
  skuService: SkuService;
  skuVariantService: SkuVariantService;
}

/**
 * Los tres sub-pasos de una combinación.
 */
export async function createSkuForCombination(
  product: Product,
  combination: VariantCombinationDto,
  body: ProductDto,
  manager: EntityManager,
  services: ProductWriteServices,
): Promise<Sku> {
  // 3.a — Resolver cada opción a una fila de `variants`.
  const variants: Variant[] = [];
  for (const option of combination.variant) {
    variants.push(
      await services.variantService.findOneOrCreate(
        option.name.trim(),
        option.value.trim(),
        manager,
      ),
    );
  }

  // 3.b — Crear el SKU. Es la unidad vendible: acá van precio y stock.
  const sku = await createSku(
    product,
    combination,
    variants.map((variant) => variant.value),
    body,
    manager,
    services.skuService,
  );

  // 3.c — Atar el SKU a sus variantes: N filas en sku_variant_values.
  await services.skuVariantService.link(
    sku.id,
    variants.map((variant) => variant.id),
    manager,
  );

  return sku;
}
