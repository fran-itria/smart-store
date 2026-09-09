import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImageService } from './product-image.service';
import { ProductImage } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage])],
  providers: [ProductImageService],
  exports: [TypeOrmModule, ProductImageService],
})
export class ProductImageModule {}
