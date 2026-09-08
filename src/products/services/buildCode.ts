import { ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Product } from '../entities/product.entity';
import { SkuService } from '../sku/sku.service';
import { slug } from './slug';

/**
 * El `code` es único a nivel global, no por producto: dos productos con el
 * mismo nombre y las mismas opciones generarían el mismo. Si el candidato
 * está tomado, se desambigua con un fragmento del id del producto.
 */
export async function buildCode(
  product: Product,
  values: string[],
  explicit: string | undefined,
  manager: EntityManager,
  skuService: SkuService,
): Promise<string> {
  if (explicit) {
    if (await skuService.codeExists(explicit, manager)) {
      throw new ConflictException(`El código ${explicit} ya está en uso`);
    }
    return explicit;
  }

  const base = [slug(product.name), ...values.map(slug)]
    .filter(Boolean)
    .join('-')
    .slice(0, 55);

  if (!(await skuService.codeExists(base, manager))) return base;

  const disambiguated = `${base}-${product.id.slice(0, 8)}`;
  if (!(await skuService.codeExists(disambiguated, manager))) {
    return disambiguated;
  }
  throw new ConflictException(
    `No se pudo generar un código único para ${base}: mandá uno explícito`,
  );
}
