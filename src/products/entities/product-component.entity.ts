import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Sku } from './sku.entity';

export enum ComponentSelectionMode {
  /** Va siempre en el combo, el cliente no lo elige ni lo puede sacar. */
  FIXED = 'fixed',
  /** El cliente decide si lo suma (extras, adicionales). */
  OPTIONAL = 'optional',
  /** Alternativa dentro del combo: el cliente elige una entre varias. */
  CHOICE = 'choice',
}

/**
 * Composición de un combo/armado: relaciona el SKU padre (lo que se vende)
 * con los SKUs que lo integran.
 *
 * Al crear la orden se expande el padre por acá para descontar el stock real:
 * por cada componente con `stockReduce = true` se descuenta
 * `selectionQuantity * cantidad pedida` del SKU componente.
 */
@Entity('product_components')
@Index(['parentSkuId', 'componentSkuId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class ProductComponent extends BaseEntity {
  /** SKU vendible que se arma (el combo). */
  @Index()
  @Column({ name: 'parent_sku_id', type: 'uuid' })
  parentSkuId!: string;

  @ManyToOne(() => Sku, (sku) => sku.components, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'parent_sku_id' })
  parentSku!: Sku;

  /** SKU que forma parte del combo. */
  @Index()
  @Column({ name: 'component_sku_id', type: 'uuid' })
  componentSkuId!: string;

  @ManyToOne(() => Sku, (sku) => sku.partOf, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'component_sku_id' })
  componentSku!: Sku;

  @Column({
    name: 'selection_mode',
    type: 'enum',
    enum: ComponentSelectionMode,
    default: ComponentSelectionMode.FIXED,
  })
  selectionMode!: ComponentSelectionMode;

  /** Unidades del componente que entran por cada unidad del combo. */
  @Column({ name: 'selection_quantity', type: 'int', default: 1 })
  selectionQuantity!: number;

  /**
   * Si al vender el combo hay que descontar stock del componente.
   * `false` para componentes que no se inventarían (un servicio, un item
   * a granel que se controla aparte).
   */
  @Column({ name: 'stock_reduce', type: 'boolean', default: true })
  stockReduce!: boolean;
}
