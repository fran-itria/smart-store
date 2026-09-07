import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SkuVariantValue } from '../../sku-variant/entities/sku-variant-value.entity';

/**
 * Un par atributo/valor del catálogo: `name` es la dimensión ("Talle",
 * "Color") y `value` la opción concreta ("M", "Rojo").
 *
 * Cada fila se reutiliza en todos los SKUs que compartan esa opción, así el
 * front puede armar los selectores agrupando por `name`.
 */
@Entity('variants')
@Index(['name', 'value'], { unique: true, where: '"deleted_at" IS NULL' })
export class Variant extends BaseEntity {
  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 120 })
  value!: string;

  @OneToMany(() => SkuVariantValue, (svv) => svv.variant)
  skuValues!: SkuVariantValue[];
}
