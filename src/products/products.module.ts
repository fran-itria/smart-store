import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product,
  ProductComponent,
  ProductImage,
  Sku,
  SkuVariantValue,
  Variant,
} from './entities';
import { ProductsController } from './products.controller';
import { ProductService } from './products.service';
import { VariantModule } from './variant/variant.module';
import { SkuModule } from './sku/sku.module';
import { SkuVariantModule } from './sku-variant/sku-variant.module';

@Module({
  imports: [
    VariantModule,
    SkuModule,
    SkuVariantModule,
    TypeOrmModule.forFeature([
      Product,
      Sku,
      Variant,
      SkuVariantValue,
      ProductImage,
      ProductComponent,
    ]),
  ],
  providers: [ProductService],
  controllers: [ProductsController],
  exports: [TypeOrmModule, ProductService],
})
export class ProductsModule { }
