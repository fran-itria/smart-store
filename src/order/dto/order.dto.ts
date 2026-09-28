import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { Currency, Delivered_method } from "../types/enum";


export class OrderItemDto {
    @IsUUID()
    sku_id!: string

    @IsInt()
    @Min(1)
    quantity!: number
}

export class OrderDto {
    @IsString()
    client_name!: string

    @IsString()
    client_surname!: string

    @IsString()
    @IsEmail()
    @IsOptional()
    mail?: string

    @IsString()
    @IsOptional()
    phone?: string

    @IsEnum(Currency)
    currency!: Currency

    @IsEnum(Delivered_method)
    delivered_method!: Delivered_method

    @IsArray()
    @ArrayNotEmpty({ message: "No se seleccionó ningún producto" })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    order_items!: OrderItemDto[]
}
