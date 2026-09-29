import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Currency, PaymenthMethod, Status } from "src/order/types/enum";

export class InstallmentDto {
    @IsString()
    order_id!: string

    @IsNumber()
    installment_number!: number

    @IsNumber()
    base_amount!: number

    @IsNumber()
    @IsOptional()
    previous_balance?: number

    @IsNumber()
    @IsOptional()
    amount_due?: number

    @IsNumber()
    @IsOptional()
    amount_received?: number

    @IsEnum(Currency)
    @IsOptional()
    currency_received?: Currency

    @IsEnum(PaymenthMethod)
    @IsOptional()
    payment_method?: PaymenthMethod

    @IsNumber()
    @IsOptional()
    exchange_rate?: number

    @IsNumber()
    @IsOptional()
    converted_amount?: number

    @IsEnum(Status)
    @IsOptional()
    status?: Status

    @IsBoolean()
    @IsOptional()
    email_notification_sent?: boolean

    @IsBoolean()
    @IsOptional()
    whatsapp_notification_sent?: boolean

    @IsString()
    period!: string

    @IsDate()
    @IsOptional()
    paid_at?: Date
}