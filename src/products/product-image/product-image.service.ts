import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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
}
