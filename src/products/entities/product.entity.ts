import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Sku } from './sku.entity';
import { ProductImage } from './product-image.entity';

export enum ProductType {
  /** Producto sin variantes: tiene un único SKU. */
  SIMPLE = 'simple',
  /** Producto con variantes (talle, color, sabor...): un SKU por combinación. */
  VARIABLE = 'variable',
  /** Combo/armado: sus SKUs se componen de otros SKUs (ver ProductComponent). */
  BUNDLE = 'bundle',
}

/**
 * Entidad "de catálogo": es lo que ve el cliente y lo que se busca/filtra.
 * No se vende directamente, no tiene precio ni stock: eso vive en sus SKUs.
 */
@Entity('products')
export class Product extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.SIMPLE })
  type!: ProductType;

  @Index()
  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @OneToMany(() => Sku, (sku) => sku.product, { cascade: ['insert'] })
  skus!: Sku[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: ['insert'],
  })
  images!: ProductImage[];
}
