import { OrderItem } from "src/orderItem/entities";
import { Sku } from "src/products/entities";
import { EntityManager } from "typeorm";

interface Props {
    manager: EntityManager
    sku: Sku
    orderId: string
    quantity: number
}

export default async function createItem({ manager, sku, orderId, quantity }: Props) {
    await manager.save(
        manager.create(OrderItem, {
            order_id: orderId,
            sku,
            discounted_price: sku.discountedPrice,
            unit_price: sku.price,
            quantity
        })
    )
}