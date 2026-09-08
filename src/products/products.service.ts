import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities';
import { ProductDto } from './dto';
import { VariantService } from './variant/variant.service';
import { SkuService } from './sku/sku.service';
import { SkuVariantService } from './sku-variant/sku-variant.service';
import { ProductImageService } from './product-image/product-image.service';
import {
    assertCombinationsAreValid,
    createSku,
    createSkuForCombination,
    ProductWriteServices,
    resolveType,
    assertPriceIsValid,
} from './services';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly variantService: VariantService,
        private readonly skuService: SkuService,
        private readonly skuVariantService: SkuVariantService,
        private readonly productImageService: ProductImageService,
        private readonly dataSource: DataSource,
    ) { }

    /** Los services que las funciones de `./services` necesitan para escribir. */
    private get writeServices(): ProductWriteServices {
        return {
            variantService: this.variantService,
            skuService: this.skuService,
            skuVariantService: this.skuVariantService,
        };
    }

    /**
     * Alta de un producto con todos sus SKUs.
     *   0. validar (fuera de la transacción: si el payload está mal, ni se abre)
     *   1. crear el Product     -> ficha de catálogo, sin precio ni stock
     *   2. crear las imágenes   -> cuelgan del producto
     *   3. un SKU por combinación, y atarle sus variantes
     *   4. releer y devolver el árbol completo
     */
    async create(body: ProductDto): Promise<Product> {
        // PASO 0
        const type = resolveType(body);
        assertPriceIsValid(body.price, body.discountedPrice, body.name);
        if (body.variants?.length) assertCombinationsAreValid(body.variants);

        const productId = await this.dataSource.transaction(async (manager) => {
            // PASO 1: el producto
            const product = await manager.save(
                manager.create(Product, {
                    name: body.name,
                    description: body.description ?? null,
                    type,
                    isPublished: body.isPublished ?? false,
                }),
            );

            // PASO 2: imágenes generales
            await this.productImageService.saveImages(
                product.id,
                body.images,
                manager,
            );

            // PASO 3: los SKUs
            if (!body.variants?.length) {
                await createSku(product, {}, [], body, manager, this.skuService);
            } else {
                for (const combination of body.variants) {
                    await createSkuForCombination(
                        product,
                        combination,
                        body,
                        manager,
                        this.writeServices,
                    );
                }
            }

            return product.id;
        });

        // PASO 4: Devolver el producto entero con sus skus
        return this.findOne(productId);
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: {
                images: true,
                skus: { variantValues: { variant: true }, images: true },
            },
            order: { images: { position: 'ASC' } },
        });
        if (!product) throw new NotFoundException(`No existe el producto ${id}`);
        return product;
    }
}
