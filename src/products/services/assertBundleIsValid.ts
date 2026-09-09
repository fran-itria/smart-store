import { BadRequestException } from '@nestjs/common';
import { ComponentSelectionMode } from '../product-component/entities/product-component.entity';
import { BundleComponentDto } from '../product-component/dto/product-component.dto';
import { ProductDto } from '../dto/product.dto';
import { bundleComponentsFor } from './bundleComponents';

/** Dos veces el mismo SKU en una lista es ambiguo: ¿cuál cantidad vale? */
function assertNoDuplicates(components: BundleComponentDto[], label: string) {
  const seen = new Set<string>();
  for (const { skuId } of components) {
    if (seen.has(skuId)) {
      throw new BadRequestException(
        `El SKU ${skuId} está repetido en ${label}: usá "quantity" en vez de repetirlo`,
      );
    }
    seen.add(skuId);
  }
}

/**
 * Reglas del payload de un combo, sin tocar la base (la existencia de los
 * SKUs la chequea `attachComponents`):
 *
 *  - ninguna lista repite un SKU
 *  - todo SKU del combo termina con al menos un componente
 *  - por ahora sólo componentes `fixed`
 *
 * Sobre lo último: el contenido de un combo queda clavado al SKU que se manda.
 * Si el cliente tiene que poder elegir (el color del joystick), eso se modela
 * con una combinación por opción en `variants`, cada una apuntando al SKU de
 * ese color; así cada alternativa tiene su propio precio, stock y código.
 * Elegir en el carrito (`optional` / `choice`) necesita que el componente
 * elegido viaje en la orden, y el módulo de órdenes todavía no existe.
 */
export function assertBundleIsValid(body: ProductDto) {
  assertNoDuplicates(body.components ?? [], 'los componentes del combo');
  for (const combination of body.variants ?? []) {
    const label = combination.variant
      .map((option) => `${option.name}: ${option.value}`)
      .join(' / ');
    assertNoDuplicates(combination.components ?? [], `la combinación ${label}`);
  }

  const combinations = body.variants?.length ? body.variants : [undefined];
  for (const combination of combinations) {
    const components = bundleComponentsFor(body, combination);

    if (!components.length) {
      throw new BadRequestException(
        'Cada combinación de un combo necesita al menos un componente: mandalos en "components" del producto o en el de la combinación',
      );
    }

    for (const component of components) {
      if (component.mode && component.mode !== ComponentSelectionMode.FIXED) {
        throw new BadRequestException(
          `El componente ${component.skuId} usa "${component.mode}": por ahora sólo se admite "fixed". Para que el cliente elija, creá una combinación en "variants" por cada opción, con el SKU correspondiente en sus "components"`,
        );
      }
    }
  }
}
