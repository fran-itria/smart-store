import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderItem } from "src/orderItem/entities/order-item.entity";
import { Sku } from "src/products/entities";
import { SkuModule } from "src/products/sku/sku.module";
import { OrderService } from "./orders.service";
import { OrderController } from "./orders.controller";
import { Orders } from "./entities/order.entity";



@Module({
    imports: [
        SkuModule,
        TypeOrmModule.forFeature([
            Sku,
            Orders,
            OrderItem
        ])
    ],
    providers: [OrderService],
    controllers: [OrderController],
    exports: [OrderService]
})
export class OrdersModule { }