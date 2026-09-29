import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Sku } from "src/products/entities";
import { OrderDto } from "./dto/order.dto";
import validateItem from "./services/validateItems";
import { Orders } from "./entities/order.entity";
import createItem from "./services/createItem";
import { InjectRepository } from "@nestjs/typeorm";
import { InstallmentService } from "src/installment/installment.service";


@Injectable()
export class OrderService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Orders)
        private readonly ordersRepository: Repository<Orders>,
        private readonly installmentService: InstallmentService
    ) { }

    async create(order: OrderDto) {
        return this.dataSource.transaction(async (manager) => {
            const items: { sku: Sku, quantity: number }[] = []
            for (const item of order.order_items) {
                const sku = await validateItem({ id: item.sku_id, manager, quantity: item.quantity })
                items.push({ sku, quantity: item.quantity })
            }

            const total_amount = items.reduce(
                (total, { sku, quantity }) => total + (sku.discountedPrice ?? sku.price) * quantity,
                0
            )

            const newOrder = await manager.save(
                manager.create(Orders, {
                    client_name: order.client_name,
                    client_surname: order.client_surname,
                    currency: order.currency,
                    delivered_method: order.delivered_method,
                    mail: order.mail,
                    phone: order.phone,
                    total_amount: Math.round(total_amount * 100) / 100
                })
            )

            for (const { sku, quantity } of items) {
                await createItem({ manager, orderId: newOrder.id, quantity, sku })
            }

            if (order.installments) {
                const base_amount = Math.floor((newOrder.total_amount / order.installments) * 100) / 100
                const last_amount = Math.round((newOrder.total_amount - base_amount * (order.installments - 1)) * 100) / 100
                const now = new Date()
                for (let i = 1; i <= order.installments; i++) {
                    const date = new Date(now.getFullYear(), now.getMonth() + i - 1, 1)
                    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
                    await this.installmentService.create({
                        installment_number: i,
                        order_id: newOrder.id,
                        base_amount: i === order.installments ? last_amount : base_amount,
                        period
                    }, manager)
                }
            }

            return manager.findOne(Orders, {
                where: { id: newOrder.id },
                relations: {
                    items: { sku: { product: true } },
                    installments: true
                }
            })
        })
    }


    async getAllOrders() {
        const orders = await this.ordersRepository.find({
            relations: {
                items: { sku: { product: true } },
                installments: true
            },
            select: {
                id: true,
                client_name: true,
                client_surname: true,
                currency: true,
                delivered_method: true,
                mail: true,
                phone: true,
                total_amount: true,
                createdAt: true,
                items: {
                    id: true,
                    discounted_price: true,
                    quantity: true,
                    unit_price: true,
                    sku: {
                        id: true,
                        images: true,
                        partOf: true,
                        price: true,
                        variantValues: true,
                        discountedPrice: true,
                        product: {
                            id: true,
                            name: true,
                            images: true
                        }
                    }
                }
            }
        })
        if (!orders.length)
            throw new NotFoundException("No se encontraron ordenes registradas")
        return orders
    }

    async getOneOrder(id: string) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: {
                items: { sku: { product: true } },
                installments: true
            },
        })
        if (!order)
            throw new NotFoundException("No se encontró la orden")
        return order
    }
}
