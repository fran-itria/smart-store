import { BundleComponentDto } from '../product-component/dto/product-component.dto';
import { ProductDto, VariantCombinationDto } from '../dto/product.dto';

/**
 * Los componentes efectivos de un SKU del combo: los comunes del producto más
 * los propios de la combinación.
 *
 * Si la combinación repite un `skuId` que ya estaba en los comunes, gana el de
 * la combinación: sirve para subir la cantidad o soltar el stock en una
 * variante puntual sin repetir toda la lista.
 */
export function bundleComponentsFor(
  body: ProductDto,
  combination?: Pick<VariantCombinationDto, 'components'>,
): BundleComponentDto[] {
  const merged = new Map<string, BundleComponentDto>();
  for (const component of body.components ?? []) {
    merged.set(component.skuId, component);
  }
  for (const component of combination?.components ?? []) {
    merged.set(component.skuId, component);
  }
  return [...merged.values()];
}
