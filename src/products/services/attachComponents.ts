import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ProductType } from '../entities/product.entity';
import { Sku } from '../sku/entities/sku.entity';
import { BundleComponentDto } from '../product-component/dto/product-component.dto';
import { ComponentSelectionMode } from '../product-component/entities/product-component.entity';
import { ProductWriteServices } from './createSkuForCombination';

/**
 * Cuántas unidades del combo se pueden armar con el stock que hay hoy.
 *
 * Lo marca el componente más escaso. `null` = ningún componente descuenta
 * stock, así que el combo no queda limitado por acá.
 */
function deriveStock(
  components: BundleComponentDto[],
  skus: Map<string, Sku>,
): number | null {
  let available: number | null = null;

  for (const component of components) {
    if (component.stockReduce === false) continue;
    const sku = skus.get(component.skuId)!;
    const possible = Math.floor(sku.stock / (component.quantity ?? 1));
    available = available === null ? possible : Math.min(available, possible);
  }

  return available;
}

/**
 * Ata los componentes al SKU del combo ya creado y devuelve el stock que le
 * corresponde (`null` si no hay que tocarlo).
 *
 * Un combo no puede contener otro combo: además de complicar el descuento de
 * stock, habilita ciclos. Si hace falta, se repiten los componentes.
 */
export async function attachComponents(
  sku: Sku,
  components: BundleComponentDto[],
  manager: EntityManager,
  services: ProductWriteServices,
): Promise<number | null> {
  const ids = components.map((component) => component.skuId);
  const found = await services.skuService.findByIds(ids, manager);
  const byId = new Map(found.map((component) => [component.id, component]));

  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) {
    throw new NotFoundException(
      `No existen los SKUs que querés meter en el combo: ${missing.join(', ')}`,
    );
  }

  for (const id of ids) {
    if (byId.get(id)!.product.type === ProductType.BUNDLE) {
      throw new BadRequestException(
        `El SKU ${id} ya es un combo: un combo no puede contener otro combo`,
      );
    }
  }

  await services.productComponentService.link(sku.id, components, manager);

  return deriveStock(
    components.filter(
      (component) =>
        (component.mode ?? ComponentSelectionMode.FIXED) ===
        ComponentSelectionMode.FIXED,
    ),
    byId,
  );
}
