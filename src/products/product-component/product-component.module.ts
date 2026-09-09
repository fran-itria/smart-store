import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductComponent } from './entities/product-component.entity';
import { ProductComponentService } from './product-component.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductComponent])],
  providers: [ProductComponentService],
  exports: [TypeOrmModule, ProductComponentService],
})
export class ProductComponentModule {}
