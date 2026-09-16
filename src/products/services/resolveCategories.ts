import { NotFoundException } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

/**
 * Traduce los `categoryIds` del payload a las categorías que se le cuelgan al
 * producto.
 *
 * Se resuelven contra la base y no se confía en los ids sueltos: un id que no
 * existe pasa la validación del DTO igual y recién explotaría como error de FK
 * al guardar el join, ya con la transacción a medio camino.
 *
 * Sin `categoryIds` devuelve `[]`: un producto sin categorías es válido.
 */
export async function resolveCategories(
  categoryIds: string[] | undefined,
  manager: EntityManager,
): Promise<Category[]> {
  const ids = [...new Set(categoryIds ?? [])];
  if (!ids.length) return [];

  const categories = await manager.find(Category, { where: { id: In(ids) } });
  const found = new Set(categories.map((category) => category.id));

  const missing = ids.filter((id) => !found.has(id));
  if (missing.length) {
    throw new NotFoundException(
      `No existen las categorías que querés asociarle al producto: ${missing.join(', ')}`,
    );
  }

  return categories;
}
