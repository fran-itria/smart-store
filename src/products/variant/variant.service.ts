import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { Variant } from './entities/variant.entity';

/** Código de Postgres para violación de único. */
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
  ) {}

  private repo(manager?: EntityManager) {
    return manager ? manager.getRepository(Variant) : this.variantRepository;
  }

  async findOneOrCreate(
    name: string,
    value: string,
    manager?: EntityManager,
  ): Promise<Variant> {
    const repo = this.repo(manager);

    const found = await repo.findOne({ where: { name, value } });
    if (found) return found;

    try {
      return await repo.save(repo.create({ name, value }));
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === UNIQUE_VIOLATION
      ) {
        const existing = await repo.findOne({ where: { name, value } });
        if (existing) return existing;
      }
      throw error;
    }
  }
}
