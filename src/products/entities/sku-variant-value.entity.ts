import { Entity, Index, JoinColumn, ManyToOne, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Sku } from './sku.entity';
import { Variant } from './variant.entity';

/**
 * Tabla intermedia SKU <-> Variant.
 *
 * Es la que define "qué es" un SKU dentro de un producto variable: el SKU
 * `REM-M-ROJO` tiene dos filas acá, una por Talle:M y otra por Color:Rojo.
 * Al crear la orden se lee esta relación para describir el ítem comprado.
 */
@Entity('sku_variant_values')
@Index(['skuId', 'variantId'], { unique: true, where: '"deleted_at" IS NULL' })
export class SkuVariantValue extends BaseEntity {
  @Index()
  @Column({ name: 'sku_id', type: 'uuid' })
  skuId!: string;

  @ManyToOne(() => Sku, (sku) => sku.variantValues, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'sku_id' })
  sku!: Sku;

  @Index()
  @Column({ name: 'variant_id', type: 'uuid' })
  variantId!: string;

  @ManyToOne(() => Variant, (variant) => variant.skuValues, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'variant_id' })
  variant!: Variant;
}
