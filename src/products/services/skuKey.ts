import { ProductCondition } from '../sku/entities/sku.entity';
import { variantKey } from './variantKey';

/**
 * Identidad de un SKU dentro de su producto: sus opciones más su estado.
 * Así dos "Color: Negro / Capacidad: 128GB" conviven si uno es nuevo y el
 * otro usado, o si tienen distinta batería.
 *
 * `[Color: Negro]`, usado, 87 -> `color=negro#usado#87`
 */
export const skuKey = (
  options: { name: string; value: string }[],
  condition: ProductCondition | null | undefined,
  battery: number | null | undefined,
) => [variantKey(options), condition ?? '', battery ?? ''].join('#');

/**
 * Condición y batería efectivas de una combinación: la propia si vino
 * (incluso `null`), si no la del producto.
 */
export function resolveSkuState(
  combination: {
    condition?: ProductCondition | null;
    battery?: number | null;
  },
  body: { condition?: ProductCondition | null; battery?: number | null },
): { condition: ProductCondition | null; battery: number | null } {
  return {
    condition:
      (combination.condition !== undefined
        ? combination.condition
        : body.condition) ?? null,
    battery:
      (combination.battery !== undefined
        ? combination.battery
        : body.battery) ?? null,
  };
}

/** Segmentos extra para el `code` autogenerado: `usado`, `bat87`. */
export const skuStateCodeParts = (state: {
  condition: ProductCondition | null;
  battery: number | null;
}) =>
  [
    state.condition ?? '',
    state.battery != null ? `bat${state.battery}` : '',
  ].filter(Boolean);
