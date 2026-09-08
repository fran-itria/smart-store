import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ComponentSelectionMode } from '../entities/product-component.entity';

export class ProductComponentDto {
  @IsUUID('4')
  parentSkuId!: string;

  @IsUUID('4')
  componentSkuId!: string;

  @IsOptional()
  @IsEnum(ComponentSelectionMode)
  selectionMode?: ComponentSelectionMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  selectionQuantity?: number;

  @IsOptional()
  @IsBoolean()
  stockReduce?: boolean;
}
