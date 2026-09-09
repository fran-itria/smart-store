import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
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

  /**
   * Los SKUs vivos de una lista de ids, con su producto cargado.
   * Puede devolver menos que los pedidos: quien llama decide qué hacer con
   * los que faltan.
   */
  async findByIds(ids: string[], manager?: EntityManager): Promise<Sku[]> {
    if (!ids.length) return [];
    return this.repo(manager).find({
      where: { id: In(ids) },
      relations: { product: true },
    });
  }

  /** Pisa el stock de un SKU. En los bundles se calcula desde los componentes. */
  async setStock(
    id: string,
    stock: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repo(manager).update(id, { stock });
  }
}
