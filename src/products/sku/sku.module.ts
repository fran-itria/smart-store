import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkuService } from './sku.service';
import { Sku } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Sku])],
  providers: [SkuService],
  exports: [TypeOrmModule, SkuService],
})
export class SkuModule {}
