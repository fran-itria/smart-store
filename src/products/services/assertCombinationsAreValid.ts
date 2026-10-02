import { BadRequestException } from '@nestjs/common';
import { ProductDto, VariantCombinationDto } from '../dto/product.dto';
import { resolveSkuState, skuKey } from './skuKey';

/**
 * Tres reglas que mantienen el catálogo usable desde el front:
 *
 *  - una combinación no repite dimensión (Talle M y Talle L en el mismo SKU)
 *  - no hay dos SKUs con la misma combinación y el mismo estado (condición +
 *    batería): ¿cuál se vende? Si difieren en el estado, son unidades
 *    distintas y conviven
 *  - todas las combinaciones usan las mismas dimensiones: si la remera se
 *    elige por talle y color, todas sus variantes necesitan ambos, o el
 *    selector del front queda con huecos
 */
export function assertCombinationsAreValid(
  combinations: VariantCombinationDto[],
  defaults: Pick<ProductDto, 'condition' | 'battery'> = {},
) {
  const seen = new Set<string>();
  let dimensions: string | null = null;

  for (const combination of combinations) {
    const { variant } = combination;
    const names = variant.map((option) => option.name.trim().toLowerCase());

    if (new Set(names).size !== names.length) {
      throw new BadRequestException(
        `Una combinación repite una dimensión: ${names.join(', ')}`,
      );
    }

    const signature = [...names].sort().join('|');
    if (dimensions === null) dimensions = signature;
    else if (dimensions !== signature) {
      throw new BadRequestException(
        'Todas las combinaciones tienen que usar las mismas dimensiones',
      );
    }

    const state = resolveSkuState(combination, defaults);
    const key = skuKey(variant, state.condition, state.battery);
    if (seen.has(key)) {
      throw new BadRequestException(
        `Combinación duplicada: ${key}. Si es otra unidad, cambiale la condición o la batería; si es la misma, sumale stock`,
      );
    }
    seen.add(key);
  }
}
