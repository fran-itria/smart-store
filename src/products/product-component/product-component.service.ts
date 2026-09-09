import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  ComponentSelectionMode,
  ProductComponent,
} from './entities/product-component.entity';
import { BundleComponentDto } from './dto/product-component.dto';

@Injectable()
export class ProductComponentService {
  constructor(
    @InjectRepository(ProductComponent)
    private readonly productComponentRepository: Repository<ProductComponent>,
  ) {}

  private repo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(ProductComponent)
      : this.productComponentRepository;
  }

  /**
   * Ata al SKU del combo los SKUs que lo integran.
   *
   * Es el equivalente de `SkuVariantService.link` para los bundles: sin estas
   * filas el SKU padre es un producto suelto con precio de combo y nada
   * adentro.
   */
  async link(
    parentSkuId: string,
    components: BundleComponentDto[],
    manager?: EntityManager,
  ): Promise<ProductComponent[]> {
    const repo = this.repo(manager);
    const rows = components.map((component) =>
      repo.create({
        parentSkuId,
        componentSkuId: component.skuId,
        selectionMode: component.mode ?? ComponentSelectionMode.FIXED,
        selectionQuantity: component.quantity ?? 1,
        stockReduce: component.stockReduce ?? true,
      }),
    );
    return repo.save(rows);
  }

  /** Qué compone a un SKU, con el SKU componente ya cargado. */
  async findByParent(
    parentSkuId: string,
    manager?: EntityManager,
  ): Promise<ProductComponent[]> {
    return this.repo(manager).find({
      where: { parentSkuId },
      relations: { componentSku: { product: true } },
    });
  }
}
