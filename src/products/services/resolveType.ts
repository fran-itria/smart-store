import { BadRequestException } from '@nestjs/common';
import { ProductType } from '../entities/product.entity';
import { ProductDto } from '../dto/product.dto';

/**
 * `type` explícito manda; si no viene se deduce de si hay combinaciones.
 * Un `bundle` no se puede dar de alta acá: sus SKUs se arman con otros SKUs
 * que ya tienen que existir, así que van por el endpoint de componentes.
 */
export function resolveType(body: ProductDto): ProductType {
  const hasVariants = Boolean(body.variants?.length);
  const type =
    body.type ?? (hasVariants ? ProductType.VARIABLE : ProductType.SIMPLE);

  if (type === ProductType.BUNDLE) {
    throw new BadRequestException(
      'Un producto bundle se arma con SKUs existentes: creá el producto y sus SKUs, y después cargá los componentes',
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
