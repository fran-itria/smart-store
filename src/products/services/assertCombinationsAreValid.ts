import { BadRequestException } from '@nestjs/common';
import { VariantCombinationDto } from '../dto/product.dto';

/**
 * Tres reglas que mantienen el catálogo usable desde el front:
 *
 *  - una combinación no repite dimensión (Talle M y Talle L en el mismo SKU)
 *  - no hay dos SKUs con la misma combinación (¿cuál se vende?)
 *  - todas las combinaciones usan las mismas dimensiones: si la remera se
 *    elige por talle y color, todas sus variantes necesitan ambos, o el
 *    selector del front queda con huecos
 */
export function assertCombinationsAreValid(
  combinations: VariantCombinationDto[],
) {
  const seen = new Set<string>();
  let dimensions: string | null = null;

  for (const { variant } of combinations) {
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

    const key = variant
      .map(
        (o) => `${o.name.trim().toLowerCase()}=${o.value.trim().toLowerCase()}`,
      )
      .sort()
      .join('|');
    if (seen.has(key)) {
      throw new BadRequestException(`Combinación duplicada: ${key}`);
    }
    seen.add(key);
  }
}
