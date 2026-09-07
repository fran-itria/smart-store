import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../product-image/entities/product-image.entity';
import { ProductComponent } from '../product-component/entities/product-component.entity';
import { SkuVariantValue } from '../entities/sku-variant-value.entity';

/**
 * Unidad vendible. Es la entidad que viaja en la orden: contra el SKU se
 * valida stock, se congela el precio y se resuelve qué combinación de
 * variantes compró el cliente.
 *
 * Un Product SIMPLE tiene 1 SKU; uno VARIABLE, un SKU por combinación de
 * variantes; uno BUNDLE, SKUs cuyo contenido se define en `components`.
 */
@Entity('skus')
export class Sku extends BaseEntity {
  @Index()
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.skus, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  /** Código interno / de barras. Único entre los SKUs vivos. */
  @Index({ unique: true, where: '"deleted_at" IS NULL' })
  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  price!: number;

  /** Precio promocional vigente. `null` = sin descuento. */
  @Column({
    name: 'discounted_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  discountedPrice!: number | null;

  /**
   * Stock propio. En un SKU de tipo BUNDLE suele ser derivado: el stock real
   * lo limitan sus componentes con `stockReduce = true`.
   */
  @Column({ type: 'int', default: 0 })
  stock!: number;

  /** Combinación de variantes que identifica a este SKU (Talle: M + Color: Rojo). */
  @OneToMany(() => SkuVariantValue, (svv) => svv.sku, { cascade: ['insert'] })
  variantValues!: SkuVariantValue[];

  @OneToMany(() => ProductImage, (image) => image.sku)
  images!: ProductImage[];

  /** Si este SKU es un combo: qué SKUs lo componen. */
  @OneToMany(() => ProductComponent, (component) => component.parentSku, {
    cascade: ['insert'],
  })
  components!: ProductComponent[];

  /** Combos que incluyen a este SKU como parte. */
  @OneToMany(() => ProductComponent, (component) => component.componentSku)
  partOf!: ProductComponent[];
}
