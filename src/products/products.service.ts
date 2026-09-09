import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product, ProductType } from './entities';
import { ProductDto, VariantCombinationDto } from './dto';
import { VariantService } from './variant/variant.service';
import { SkuService } from './sku/sku.service';
import { SkuVariantService } from './sku-variant/sku-variant.service';
import { ProductImageService } from './product-image/product-image.service';
import { ProductComponentService } from './product-component/product-component.service';
import { Sku } from './sku/entities/sku.entity';
import {
  assertBundleIsValid,
  assertCombinationsAreValid,
  attachComponents,
  bundleComponentsFor,
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
    private readonly productComponentService: ProductComponentService,
    private readonly dataSource: DataSource,
  ) {}

  /** Los services que las funciones de `./services` necesitan para escribir. */
  private get writeServices(): ProductWriteServices {
    return {
      variantService: this.variantService,
      skuService: this.skuService,
      skuVariantService: this.skuVariantService,
      productComponentService: this.productComponentService,
    };
  }

  /**
   * Alta de un producto con todos sus SKUs.
   *   0. validar (fuera de la transacción: si el payload está mal, ni se abre)
   *   1. crear el Product     -> ficha de catálogo, sin precio ni stock
   *   2. crear las imágenes   -> cuelgan del producto
   *   3. un SKU por combinación, y atarle sus variantes
   *   3.bis si es un combo, atarle además los SKUs que lo integran
   *   4. releer y devolver el árbol completo
   */
  async create(body: ProductDto): Promise<Product> {
    // PASO 0
    const type = resolveType(body);
    assertPriceIsValid(body.price, body.discountedPrice, body.name);
    if (body.variants?.length) assertCombinationsAreValid(body.variants);
    if (type === ProductType.BUNDLE) assertBundleIsValid(body);

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
        const sku = await createSku(
          product,
          {},
          [],
          body,
          manager,
          this.skuService,
        );
        await this.attachBundle(sku, body, undefined, type, manager);
      } else {
        for (const combination of body.variants) {
          const sku = await createSkuForCombination(
            product,
            combination,
            body,
            manager,
            this.writeServices,
          );
          await this.attachBundle(sku, body, combination, type, manager);
        }
      }

      return product.id;
    });

    // PASO 4: Devolver el producto entero con sus skus
    return this.findOne(productId);
  }

  /**
   * PASO 3.bis — sólo para combos: ata al SKU recién creado los SKUs que lo
   * componen y le recalcula el stock, que no es propio sino el que permiten
   * sus componentes.
   */
  private async attachBundle(
    sku: Sku,
    body: ProductDto,
    combination: VariantCombinationDto | undefined,
    type: ProductType,
    manager: EntityManager,
  ): Promise<void> {
    if (type !== ProductType.BUNDLE) return;

    const stock = await attachComponents(
      sku,
      bundleComponentsFor(body, combination),
      manager,
      this.writeServices,
    );
    if (stock !== null) {
      await this.skuService.setStock(sku.id, stock, manager);
    }
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        images: true,
        skus: {
          variantValues: { variant: true },
          images: true,
          // en un combo, qué trae adentro cada SKU vendible
          components: {
            componentSku: {
              product: true,
              variantValues: { variant: true },
            },
          },
        },
      },
      order: { images: { position: 'ASC' } },
    });
    if (!product) throw new NotFoundException(`No existe el producto ${id}`);
    return product;
  }

  /**
   * Listado de catálogo.
   *
   * `select` recorta las columnas nivel por nivel: sin él la grilla se trae
   * descripciones, timestamps y el árbol de componentes de cada combo.
   *
   * Dos reglas al usarlo:
   *  - la relación se sigue declarando en `relations`; el `select` anidado
   *    sólo dice qué columnas traer de ella, no la carga
   *  - conviene dejar el `id` en cada nivel: es con lo que TypeORM arma el
   *    árbol al hidratar
   */
  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find({
      select: {
        id: true,
        name: true,
        type: true,
        isPublished: true,
        images: { id: true, url: true, position: true },
        skus: {
          id: true,
          code: true,
          price: true,
          discountedPrice: true,
          stock: true,
          variantValues: {
            id: true,
            variant: { id: true, name: true, value: true },
          },
        },
      },
      relations: {
        images: true,
        skus: { variantValues: { variant: true } },
      },
      order: { name: 'ASC', images: { position: 'ASC' } },
    });
    if (!products.length) {
      throw new NotFoundException(`No hay productos registrados`);
    }
    return products;
  }
}
