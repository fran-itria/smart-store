import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { BEARER_AUTH } from "src/config/swagger";
import { OrderDto } from "./dto/order.dto";
import { OrderService } from "./orders.service";
import { Public } from "src/common/decorators/public.decorator";

@ApiTags("orders")
@ApiBearerAuth(BEARER_AUTH)
@Controller("orders")
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @Public()
    create(@Body() body: OrderDto) {
        return this.orderService.create(body)
    }

    @Get()
    @Public()
    getAll() {
        return this.orderService.getAllOrders()
    }

    @Get("one/:id")
    @Public()
    getOne(@Param('id') id: string) {
        return this.orderService.getOneOrder(id)
    }
}
