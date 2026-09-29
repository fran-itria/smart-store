import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Installment } from './entities/installment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InstallmentDto } from './dto/installment.dto';

@Injectable()
export class InstallmentService {
    constructor(
        @InjectRepository(Installment)
        private readonly installmentsRepository: Repository<Installment>,
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
}
