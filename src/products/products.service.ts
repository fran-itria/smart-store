import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product, ProductType } from './entities';
import {
  ProductDto,
  UpdateProductDto,
  UpdateVariantCombinationDto,
  VariantCombinationDto,
} from './dto';
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
  resolveCategories,
  assertSkusAreFree,
  updateSku,
  variantKey,
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
   *   1. crear el Product     -> ficha de catálogo, sin precio ni stock,
   *                              atado a las categorías que vinieron por id
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
      // PASO 1: el producto, con sus categorías
      const categories = await resolveCategories(body.categoryIds, manager);
      const product = await manager.save(
        manager.create(Product, {
          name: body.name,
          description: body.description ?? null,
          type,
          isPublished: body.isPublished ?? false,
          categories,
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
   * Edición completa de un producto: el payload describe cómo queda entero.
   *   0. validar, igual que el alta
   *   1. emparejar cada combinación con el SKU que ya existe: primero por
   *      `skuId`, después por sus opciones; las que no encuentran, se crean
   *   2. chequear que no se rompa ningún combo ajeno: ni dar de baja un SKU
   *      que otro combo usa, ni volver combo un producto que otro contiene
   *   3. la ficha: nombre, descripción, tipo, publicación y categorías
   *   4. las imágenes generales, si vinieron
   *   5. baja lógica de los SKUs que ya no están
   *   6. actualizar los que siguen, crear los nuevos y rehacer el contenido
   *      de los combos
   *   7. releer y devolver el árbol completo
   */
  async update(id: string, body: UpdateProductDto): Promise<Product> {
    // PASO 0
    const type = resolveType(body);
    assertPriceIsValid(
      body.price,
      body.discountedPrice ?? undefined,
      body.name,
    );
    if (body.variants?.length) assertCombinationsAreValid(body.variants);
    if (type === ProductType.BUNDLE) assertBundleIsValid(body);

    await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id },
        relations: { categories: true },
      });
      if (!product) throw new NotFoundException(`No existe el producto ${id}`);

      // Aparte del producto: si viajaran en `product.skus`, el `save` del
      // paso 3 intentaría "desenganchar" los que no vinieran.
      const existing = await manager.find(Sku, {
        where: { productId: id },
        relations: { variantValues: { variant: true } },
      });

      // PASO 1
      const combinations: (UpdateVariantCombinationDto | undefined)[] = body
        .variants?.length
        ? body.variants
        : [undefined];
      const matches = this.matchSkus(combinations, existing);
      const kept = new Set(matches.map((match) => match.sku?.id));
      const removed = existing.filter((sku) => !kept.has(sku.id));

      // PASO 2
      await assertSkusAreFree(
        removed.map((sku) => sku.id),
        'No se puede quitar un SKU',
        manager,
      );
      if (type === ProductType.BUNDLE && product.type !== ProductType.BUNDLE) {
        await assertSkusAreFree(
          existing.map((sku) => sku.id),
          'No se puede convertir en combo',
          manager,
        );
      }

      // PASO 3
      product.name = body.name;
      product.type = type;
      if (body.description !== undefined) {
        product.description = body.description ?? null;
      }
      if (body.isPublished !== undefined)
        product.isPublished = body.isPublished;
      if (body.categoryIds !== undefined) {
        product.categories = await resolveCategories(body.categoryIds, manager);
      }
      await manager.save(product);

      // PASO 4
      if (body.images !== undefined) {
        await this.productImageService.replaceImages(id, body.images, manager);
      }

      // PASO 5: antes de tocar los demás, así sus códigos quedan libres
      await this.skuService.softDelete(
        removed.map((sku) => sku.id),
        manager,
      );

      // PASO 6
      for (const { combination, sku: current } of matches) {
        let sku: Sku;
        if (current) {
          await updateSku(
            current,
            combination ?? {},
            body,
            manager,
            this.writeServices,
          );
          await this.productComponentService.unlinkByParent(
            current.id,
            manager,
          );
          sku = current;
        } else if (combination) {
          sku = await createSkuForCombination(
            product,
            combination,
            body,
            manager,
            this.writeServices,
          );
        } else {
          sku = await createSku(
            product,
            {},
            [],
            body,
            manager,
            this.skuService,
          );
        }
        await this.attachBundle(sku, body, combination, type, manager);
      }
    });

    // PASO 7
    return this.findOne(id);
  }

  /**
   * PASO 1 del update: a qué SKU existente corresponde cada combinación
   * (`sku` vacío = hay que crearlo). Un producto simple es una única
   * "combinación" `undefined`, que empareja con el SKU sin opciones.
   */
  private matchSkus(
    combinations: (UpdateVariantCombinationDto | undefined)[],
    existing: Sku[],
  ): { combination?: UpdateVariantCombinationDto; sku?: Sku }[] {
    const free = new Map(existing.map((sku) => [sku.id, sku]));

    // Primero los que vienen por id, para que no los "robe" el match por
    // opciones de otra combinación.
    const byId = combinations.map((combination) => {
      if (!combination?.skuId) return undefined;
      const sku = free.get(combination.skuId);
      if (!sku) {
        throw new BadRequestException(
          `El SKU ${combination.skuId} no es de este producto o está repetido`,
        );
      }
      free.delete(sku.id);
      return sku;
    });

    return combinations.map((combination, index) => {
      let sku = byId[index];
      if (!sku) {
        const key = variantKey(combination?.variant ?? []);
        sku = [...free.values()].find(
          (candidate) =>
            variantKey(
              candidate.variantValues.map((value) => value.variant),
            ) === key,
        );
        if (sku) free.delete(sku.id);
      }
      return { combination, sku };
    });
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
      select: {
        id: true,
        name: true,
        type: true,
        isPublished: true,
        categories: { id: true, name: true },
        images: { id: true, url: true, position: true },
        description: true,
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
          components: {
            id: true,
            componentSku: {
              id: true,
              product: {
                id: true,
                name: true,
              },
              variantValues: {
                id: true,
                variant: {
                  id: true,
                  name: true,
                  value: true,
                },
              },
            },
          },
        },
      },
      relations: {
        categories: true,
        images: true,
        skus: {
          variantValues: { variant: true },
          images: true,
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
        categories: { id: true, name: true },
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
          components: {
            id: true,
            componentSku: {
              id: true,
              product: {
                id: true,
                name: true,
              },
              variantValues: {
                id: true,
                variant: {
                  id: true,
                  name: true,
                  value: true,
                },
              },
            },
          },
        },
      },
      relations: {
        categories: true,
        images: true,
        skus: {
          variantValues: { variant: true },
          components: {
            componentSku: {
              product: true,
              variantValues: { variant: true },
            },
          },
        },
      },
      order: { name: 'ASC', images: { position: 'ASC' } },
    });
    if (!products.length) {
      throw new NotFoundException(`No hay productos registrados`);
    }
    return products;
  }
}
