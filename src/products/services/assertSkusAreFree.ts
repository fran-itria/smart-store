import { ConflictException } from '@nestjs/common';
import { EntityManager, In, IsNull } from 'typeorm';
import { ProductComponent } from '../product-component/entities/product-component.entity';

/**
 * Falla si algún SKU de la lista forma parte de un combo vivo.
 *
 * Se usa antes de dar de baja SKUs (el combo quedaría apuntando a algo que
 * ya no se vende) y antes de convertir un producto en combo (un combo no
 * puede contener otro combo).
 */
export async function assertSkusAreFree(
  skuIds: string[],
  reason: string,
  manager: EntityManager,
): Promise<void> {
  if (!skuIds.length) return;

  const usages = await manager.find(ProductComponent, {
    where: {
      componentSkuId: In(skuIds),
      parentSku: { deletedAt: IsNull() },
    },
    relations: { parentSku: { product: true } },
  });
  if (!usages.length) return;

  const bundles = [
    ...new Set(usages.map((usage) => usage.parentSku.product.name)),
  ];
  throw new ConflictException(
    `${reason}: forma parte de ${bundles.length > 1 ? 'los combos' : 'el combo'} ${bundles.join(', ')}. Sacalo de ahí primero`,
  );
}
