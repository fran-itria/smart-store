import { ConflictException, NotFoundException } from "@nestjs/common"
import { Sku } from "src/products/entities"
import { EntityManager } from "typeorm"

interface Props {
    manager: EntityManager,
    id: string,
    quantity: number
}

export default async function validateItem({ manager, id, quantity }: Props): Promise<Sku> {
    const sku = await manager.findOne(Sku, { where: { id }, relations: { product: true } })
    if (!sku)
        throw new NotFoundException("No se encontró producto seleccionado")

    // Descuento atómico: el WHERE "stock >= quantity" evita vender de más si
    // dos órdenes compran el mismo SKU al mismo tiempo.
    const result = await manager
        .createQueryBuilder()
        .update(Sku)
        .set({ stock: () => "stock - :quantity" })
        .where("id = :id AND stock >= :quantity", { id, quantity })
        .execute()
    if (!result.affected)
        throw new ConflictException(`Stock insuficiente de ${sku.product.name}`)

    return sku
}
