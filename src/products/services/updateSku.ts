import { ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Sku } from '../sku/entities/sku.entity';
import { ProductDto, VariantCombinationDto } from '../dto/product.dto';
import { assertPriceIsValid } from './assertPriceIsValid';
import { ProductWriteServices } from './createSkuForCombination';
import { resolveVariants } from './resolveVariants';
import { variantKey } from './variantKey';

/**
 * La contraparte de `createSkuForCombination` para un SKU que ya existe.
 *
 * Precio sale de la combinación o del producto, como en el alta. Lo que no
 * viene en ninguno de los dos queda como estaba: el stock (pisarlo con 0 por
 * no mandarlo vaciaría el depósito), el código (es el de barras, no se
 * regenera) y el descuento (`null` lo borra).
 *
 * `sku.variantValues` tiene que venir cargado con su `variant`.
 */
export async function updateSku(
  sku: Sku,
  combination: Omit<VariantCombinationDto, 'variant'> &
    Partial<Pick<VariantCombinationDto, 'variant'>>,
  body: ProductDto,
  manager: EntityManager,
  services: ProductWriteServices,
): Promise<void> {
  const options = combination.variant ?? [];
  const current = sku.variantValues.map((value) => value.variant);

  const price = combination.price ?? body.price;
  const discountedPrice =
    combination.discountedPrice !== undefined
      ? combination.discountedPrice
      : body.discountedPrice !== undefined
        ? body.discountedPrice
        : sku.discountedPrice;
  assertPriceIsValid(
    price,
    discountedPrice ?? undefined,
    options.map((option) => option.value).join('/') || sku.code,
  );

  const code = combination.code ?? sku.code;
  if (
    code !== sku.code &&
    (await services.skuService.codeExists(code, manager))
  ) {
    throw new ConflictException(`El código ${code} ya está en uso`);
  }

  await services.skuService.update(
    sku.id,
    {
      code,
      price,
      discountedPrice,
      stock: combination.stock ?? body.stock ?? sku.stock,
    },
    manager,
  );

  // Sólo si le cambiaron las opciones (vino por `skuId` con otras).
  if (variantKey(options) !== variantKey(current)) {
    const variants = await resolveVariants(
      options,
      services.variantService,
      manager,
    );
    await services.skuVariantService.unlinkBySku(sku.id, manager);
    await services.skuVariantService.link(
      sku.id,
      variants.map((variant) => variant.id),
      manager,
    );
  }
}
