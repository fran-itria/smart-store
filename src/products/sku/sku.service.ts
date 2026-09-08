import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Sku } from '../entities';
import { SkuDto } from './dto/sku.dto';

@Injectable()
export class SkuService {
  constructor(
    @InjectRepository(Sku)
    private readonly skuRepository: Repository<Sku>,
  ) {}

  private repo(manager?: EntityManager) {
    return manager ? manager.getRepository(Sku) : this.skuRepository;
  }

  async create(body: SkuDto, manager?: EntityManager): Promise<Sku> {
    const repo = this.repo(manager);
    return repo.save(repo.create(body));
  }

  /** Si el código ya está tomado. El único es global, no por producto. */
  async codeExists(code: string, manager?: EntityManager): Promise<boolean> {
    return (await this.repo(manager).countBy({ code })) > 0;
  }
}
