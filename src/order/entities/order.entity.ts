import { BaseEntity } from "src/common/entities/base.entity";
import { OrderItem } from "src/orderItem/entities/order-item.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Currency, Delivered_method } from "../types/enum";
import { decimalTransformer } from "src/common/transformers/decimal.transformer";
import { Installment } from "src/installment/entities/installment.entity";

@Entity("orders")
export class Orders extends BaseEntity {
    @Column({ type: 'integer', generated: 'increment', unique: true })
    orderNumber!: number;

    @Column({ type: 'varchar', nullable: false })
    client_name!: string

    @Column({ type: 'varchar', nullable: false })
    client_surname!: string

    @Column({ type: 'varchar', nullable: true })
    mail?: string

    @Column({ type: 'varchar', nullable: true })
    phone?: string

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: false, transformer: decimalTransformer })
    total_amount!: number

    @Column({ type: "enum", enum: Currency, nullable: false })
    currency!: Currency

    @Column({ type: "enum", enum: Delivered_method, nullable: false })
    delivered_method!: Delivered_method

    @OneToMany(() => OrderItem, (item) => item.order)
    items!: OrderItem[]

    @OneToMany(() => Installment, (installment) => installment.order)
    installments?: Installment[]
}
