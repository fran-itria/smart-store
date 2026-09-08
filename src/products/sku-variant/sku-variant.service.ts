import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SkuVariantValue } from './entities/sku-variant-value.entity';

@Injectable()
export class SkuVariantService {
  constructor(
    @InjectRepository(SkuVariantValue)
    private readonly skuVariantRepository: Repository<SkuVariantValue>,
  ) {}

  private repo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(SkuVariantValue)
      : this.skuVariantRepository;
  }

  /**
   * Ata a un SKU las variantes que lo identifican.
   *
   * Es el paso que convierte un SKU suelto en "la remera talle M roja": sin
   * estas filas el SKU no tiene variedad, sólo un `code` que es texto.
   */
  async link(
    skuId: string,
    variantIds: string[],
    manager?: EntityManager,
  ): Promise<SkuVariantValue[]> {
    const repo = this.repo(manager);
    const rows = variantIds.map((variantId) =>
      repo.create({ skuId, variantId }),
    );
    return repo.save(rows);
  }

  /** Las variantes de un SKU, con la variante ya cargada. */
  async findBySku(
    skuId: string,
    manager?: EntityManager,
  ): Promise<SkuVariantValue[]> {
    return this.repo(manager).find({
      where: { skuId },
      relations: { variant: true },
    });
  }
}
