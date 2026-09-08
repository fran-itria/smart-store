import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variant } from './entities/variant.entity';
import { VariantService } from './variant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Variant])],
  providers: [VariantService],
  exports: [TypeOrmModule, VariantService],
})
export class VariantModule {}
