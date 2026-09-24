import { EntityManager } from 'typeorm';
import { Variant } from '../variant/entities/variant.entity';
import { VariantService } from '../variant/variant.service';
import { VariantOptionDto } from '../dto/product.dto';

/** Resuelve cada opción de una combinación a su fila de `variants`. */
export async function resolveVariants(
  options: VariantOptionDto[],
  variantService: VariantService,
  manager: EntityManager,
): Promise<Variant[]> {
  const variants: Variant[] = [];
  for (const option of options) {
    variants.push(
      await variantService.findOneOrCreate(
        option.name.trim(),
        option.value.trim(),
        manager,
      ),
    );
  }
  return variants;
}
