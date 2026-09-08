import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImageService } from './product-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImageService])],
  providers: [ProductImageService],
  exports: [TypeOrmModule, ProductImageService],
})
export class ProductImageModule {}
