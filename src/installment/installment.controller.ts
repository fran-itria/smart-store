import { Body, Controller, Put } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Currency } from 'src/order/types/enum';
import { InstallmentDto } from './dto/installment.dto';
import { Installment } from './entities/installment.entity';
import { InstallmentService } from './installment.service';

@ApiTags('installment')
@Controller('installment')
export class InstallmentController {
    constructor(
        private readonly installmentServices: InstallmentService
    ) { }

    @Put()
    @Public()
    @ApiOperation({
        summary: 'Registrar el pago de una cuota',
        description: [
            'Identifica la cuota por `id`',
            'y le carga lo recibido en `dto`.',
            '',
            '`converted_amount` es la cotización (pesos por dólar), obligatoria',
            'cuando `currency_received` no coincide con la moneda de la orden.',
        ].join('\n'),
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['orderId', 'id', 'dto'],
            properties: {
                orderId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Orden a la que pertenece la cuota.',
                },
                id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Cuota a actualizar.',
                },
                dto: {
                    type: 'object',
                    properties: {
                        amount_received: {
                            type: 'number',
                            description: 'Monto recibido, en `currency_received`.',
                        },
                        currency_received: {
                            type: 'string',
                            enum: Object.values(Currency),
                            description: 'Moneda en la que se recibió el pago. Si se omite, se asume la moneda de la orden.',
                        },
                        converted_amount: {
                            type: 'number',
                            description: 'Cotización (pesos por dólar). Obligatoria si `currency_received` difiere de la moneda de la orden.',
                        },
                    },
                },
            },
        },
        examples: {
            pesos: {
                summary: 'Pago en pesos',
                value: {
                    id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
                    dto: {
                        amount_received: 25000,
                        currency_received: Currency.ARS,
                        converted_amount: 1250,
                    },
                },
            },
            dolares: {
                summary: 'Pago en dólares',
                value: {
                    id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
                    dto: {
                        amount_received: 20,
                        currency_received: Currency.US,
                        converted_amount: 1250,
                    },
                },
            },
        },
    })
    @ApiOkResponse({
        description: 'La cuota, con su orden.',
        type: Installment,
    })
    @ApiBadRequestResponse({ description: 'Payload inválido.' })
    @ApiNotFoundResponse({ description: 'No existe la cuota.' })
    async updateInstallment(@Body() { id, dto }: {
        orderId: string,
        id: string,
        dto: Pick<InstallmentDto,
            'amount_received' | 'converted_amount' | 'currency_received'>
    }) {
        return await this.installmentServices.update({ id, dto })
    }
}
