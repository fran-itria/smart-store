import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { ProductImage } from '../entities';

@Injectable()
export class ProductImageService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly ProductImageRepository: Repository<ProductImage>,
  ) {}

  private repo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(ProductImage)
      : this.ProductImageRepository;
  }

  async saveImages(
    productId: string,
    urls: string[] | undefined,
    manager?: EntityManager,
  ) {
    if (!urls?.length) return;
    const repo = this.repo(manager);
    await repo.save(
      urls.map((url, position) => repo.create({ productId, url, position })),
    );
  }

  /**
   * Reemplaza las imágenes generales del producto por `urls`, en ese orden.
   * Las de un SKU puntual (`skuId` seteado) no se tocan.
   */
  async replaceImages(
    productId: string,
    urls: string[],
    manager?: EntityManager,
  ) {
    await this.repo(manager).delete({ productId, skuId: IsNull() });
    await this.saveImages(productId, urls, manager);
  }
}
