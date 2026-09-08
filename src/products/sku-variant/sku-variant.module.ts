import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkuVariantValue } from './entities/sku-variant-value.entity';
import { SkuVariantService } from './sku-variant.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkuVariantValue])],
  providers: [SkuVariantService],
  exports: [TypeOrmModule, SkuVariantService],
})
export class SkuVariantModule {}
