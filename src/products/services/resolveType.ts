import { BadRequestException } from '@nestjs/common';
import { ProductType } from '../entities/product.entity';
import { ProductDto } from '../dto/product.dto';

/**
 * `type` explícito manda; si no viene se deduce del payload: hay componentes
 * -> `bundle`, hay combinaciones -> `variable`, si no `simple`.
 *
 * Un `bundle` se arma con SKUs que ya existen: el alta sólo crea la ficha del
 * combo y sus SKUs vendibles, y los ata a los componentes.
 */
export function resolveType(body: ProductDto): ProductType {
  const hasVariants = Boolean(body.variants?.length);
  const hasComponents =
    Boolean(body.components?.length) ||
    Boolean(
      body.variants?.some((combination) => combination.components?.length),
    );

  const type =
    body.type ??
    (hasComponents
      ? ProductType.BUNDLE
      : hasVariants
        ? ProductType.VARIABLE
        : ProductType.SIMPLE);

  if (type === ProductType.BUNDLE) {
    if (!hasComponents) {
      throw new BadRequestException(
        'Un combo necesita al menos un componente: mandá "components" con los SKUs que lo integran',
      );
    }
    return type;
  }

  if (hasComponents) {
    throw new BadRequestException(
      'Sólo un producto bundle lleva "components": sacalos o mandá type "bundle"',
    );
  }
  if (type === ProductType.SIMPLE && hasVariants) {
    throw new BadRequestException(
      'Un producto simple no lleva variantes: usá type "variable"',
    );
  }
  if (type === ProductType.VARIABLE && !hasVariants) {
    throw new BadRequestException(
      'Un producto variable necesita al menos una combinación de variantes',
    );
  }
  return type;
}
