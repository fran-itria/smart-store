import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product,
  ProductComponent,
  ProductImage,
  Sku,
  SkuVariantValue,
  Variant,
} from './entities';

/**
 * Catálogo: Product -> Sku -> (variantes, imágenes, componentes).
 * Por ahora sólo registra las entidades; los repositorios quedan disponibles
 * para inyectar y se exporta TypeOrmModule para que otros módulos (órdenes,
 * stock) los usen sin volver a declararlos.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Sku,
      Variant,
      SkuVariantValue,
      ProductImage,
      ProductComponent,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
