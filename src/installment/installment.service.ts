import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Installment } from './entities/installment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InstallmentDto } from './dto/installment.dto';
import { Orders } from 'src/order/entities/order.entity';
import { Currency, Status, Status_order } from 'src/order/types/enum';

const round2 = (n: number) => Math.round(n * 100) / 100

@Injectable()
export class InstallmentService {
    constructor(
        @InjectRepository(Installment)
        private readonly installmentsRepository: Repository<Installment>,
        @InjectRepository(Orders)
        private readonly ordersRepository: Repository<Orders>
    ) { }

    private repo(manager?: EntityManager) {
        return manager ? manager.getRepository(Installment) : this.installmentsRepository
    }

    async create(
        dto: Pick<InstallmentDto, "order_id" | "base_amount" | "installment_number" | "period">,
        manager?: EntityManager
    ) {
        const repo = this.repo(manager)
        return await repo.save(repo.create({ ...dto, amount_due: dto.base_amount }))
    }

    async update({ id, dto }: {
        id: string,
        dto: Pick<
            InstallmentDto,
            'amount_received' | 'converted_amount' | 'currency_received' | 'payment_method'
        >
    }) {
        const installment = await this.installmentsRepository.findOne({
            where: {
                id
            },
            relations: {
                order: { installments: true }
            }
        })
        if (!installment) throw new NotFoundException("Cuota no encontrada")

        const order = installment.order

        // converted_amount es la cotización: pesos por cada dólar
        const { amount_received, converted_amount: exchange_rate, payment_method } = dto
        const currency_received = dto.currency_received ?? order.currency

        if (amount_received == null) throw new BadRequestException("Falta el monto recibido")

        // Todo el cálculo de la cuota y de la siguiente se hace en la moneda de la orden
        let received = amount_received
        if (currency_received != order.currency) {
            if (!exchange_rate) throw new BadRequestException("Falta la cotización para convertir el pago a la moneda de la orden")
            received = order.currency == Currency.US
                ? amount_received / exchange_rate
                : amount_received * exchange_rate
            received = round2(received)
        }

        const amount_due = installment.amount_due ?? installment.base_amount
        const nextInstallment = order.installments?.find(i => i.installment_number == (installment.installment_number + 1))

        if (received != amount_due) {
            if (!nextInstallment)
                throw new ConflictException("No hay cuota siguiente a la que aplicar deuda, se debe abonar el total")

            const next_amount_due = nextInstallment.amount_due ?? nextInstallment.base_amount
            if (received < amount_due) {
                const previous_balance = round2(amount_due - received)
                installment.status = Status.PARTIAL
                nextInstallment.previous_balance = previous_balance
                nextInstallment.amount_due = round2(next_amount_due + previous_balance)
            } else {
                installment.status = Status.PAID
                nextInstallment.amount_due = round2(next_amount_due - (received - amount_due))
            }
            await this.installmentsRepository.save(nextInstallment)
        } else
            installment.status = Status.PAID

        installment.amount_received = amount_received
        installment.paid_at = new Date()
        installment.currency_received = currency_received
        installment.exchange_rate = currency_received != order.currency ? exchange_rate : null
        installment.converted_amount = received
        installment.payment_method = payment_method

        await this.installmentsRepository.save(installment)

        const installments = order.installments!.map(i => i.id == installment.id ? installment : i)
        await this.ordersRepository.update(order.id, {
            status: this.isOrderPaid(installments) ? Status_order.PAID : Status_order.COURSE
        })

        return this.ordersRepository.findOne({
            where: { id: installment.order.id },
            relations: { installments: true },
            order: { installments: { installment_number: "ASC" } }
        })
    }

    // Una cuota PARTIAL no deja deuda propia: el faltante pasó al amount_due de la
    // siguiente, así que queda saldada cuando se salda esa. Por eso alcanza con
    // que las PAID cubran su amount_due y que la última no haya quedado PARTIAL.
    private isOrderPaid(installments: Installment[]) {
        const last = Math.max(...installments.map(i => i.installment_number))
        return installments.every(i => {
            const amount_due = i.amount_due ?? i.base_amount
            if (amount_due <= 0) return true
            if (i.status == Status.PARTIAL) return i.installment_number != last
            return i.status == Status.PAID && (i.converted_amount ?? 0) >= amount_due
        })
    }
}
