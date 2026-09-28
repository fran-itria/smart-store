import { BaseEntity } from "src/common/entities/base.entity";
import { Sku } from "src/products/entities";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Orders } from "src/order/entities/order.entity";
import { decimalTransformer } from "src/common/transformers/decimal.transformer";


@Entity("order_items")
export class OrderItem extends BaseEntity {
    @Column({ type: 'uuid' })
    order_id!: string

    @ManyToOne(() => Orders, (order) => order.items, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: "order_id" })
    order!: Orders

    @Column({ type: 'integer' })
    quantity!: number

    @Column({ type: 'numeric', precision: 12, scale: 2, transformer: decimalTransformer })
    unit_price!: number

    /** Precio con descuento al momento de la compra. `null` = sin descuento. */
    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: decimalTransformer })
    discounted_price!: number | null

    @ManyToOne(() => Sku, (sku) => sku.items, { nullable: false })
    @JoinColumn({ name: "sku_id" })
    sku!: Sku
}