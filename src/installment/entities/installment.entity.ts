import { BaseEntity } from "src/common/entities/base.entity";
import { decimalTransformer } from "src/common/transformers/decimal.transformer";
import { Orders } from "src/order/entities/order.entity";
import { Currency, PaymenthMethod, Status } from "src/order/types/enum";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";


@Entity("installment")
export class Installment extends BaseEntity {
    @Column({ type: "uuid" })
    order_id!: string

    @ManyToOne(() => Orders, (order) => order.installments, { nullable: false })
    @JoinColumn({ name: "order_id" })
    order!: Orders

    @Column({ type: "integer" })
    installment_number!: number

    @Column({ type: "numeric", precision: 12, scale: 2, transformer: decimalTransformer })
    base_amount!: number

    @Column({ type: "numeric", precision: 12, scale: 2, transformer: decimalTransformer, nullable: true })
    previous_balance?: number | null

    @Column({ type: "numeric", precision: 12, scale: 2, transformer: decimalTransformer, nullable: true })
    amount_due?: number | null

    @Column({ type: "numeric", precision: 12, scale: 2, transformer: decimalTransformer, nullable: true })
    amount_received?: number | null

    @Column({ type: "enum", enum: Currency, nullable: true })
    currency_received?: Currency | null

    @Column({ type: "enum", enum: PaymenthMethod, nullable: true })
    payment_method?: PaymenthMethod | null

    @Column({ type: "numeric", precision: 12, scale: 4, transformer: decimalTransformer, nullable: true })
    exchange_rate?: number | null

    @Column({ type: "numeric", precision: 12, scale: 2, transformer: decimalTransformer, nullable: true })
    converted_amount?: number | null

    @Column({ type: "enum", enum: Status, default: Status.PENDING })
    status!: Status

    @Column({ type: "boolean", default: false })
    email_notification_sent!: boolean

    @Column({ type: "boolean", default: false })
    whatsapp_notification_sent!: boolean

    @Column({ type: "varchar" })
    period!: string

    @Column({ type: "timestamptz", nullable: true })
    paid_at!: Date | null
}