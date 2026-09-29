import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderItem } from "src/orderItem/entities/order-item.entity";
import { Sku } from "src/products/entities";
import { SkuModule } from "src/products/sku/sku.module";
import { OrderService } from "./orders.service";
import { OrderController } from "./orders.controller";
import { Orders } from "./entities/order.entity";
import { InstallmentService } from "src/installment/installment.service";
import { InstallmentModule } from "src/installment/installment.module";



@Module({
    imports: [
        SkuModule,
        InstallmentModule,
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