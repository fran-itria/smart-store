import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from './product.entity';
import { Sku } from './sku.entity';

/**
 * Imagen del catálogo.
 *
 * Siempre cuelga de un Product. `skuId` es opcional: cuando está seteado la
 * imagen corresponde a una variante puntual (la remera roja) y el front la
 * muestra al seleccionarla; cuando es `null` es una imagen general del
 * producto.
 */
@Entity('product_images')
@Index(['productId', 'position'])
export class ProductImage extends BaseEntity {
  @Index()
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Index()
  @Column({ name: 'sku_id', type: 'uuid', nullable: true })
  skuId!: string | null;

  @ManyToOne(() => Sku, (sku) => sku.images, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'sku_id' })
  sku!: Sku | null;

  @Column({ type: 'text' })
  url!: string;

  /** Orden de aparición dentro del producto. Menor = primero. */
  @Column({ type: 'int', default: 0 })
  position!: number;
}
