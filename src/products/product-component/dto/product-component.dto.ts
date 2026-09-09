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

/**
 * Un componente declarado dentro del alta del combo (`POST /products`).
 *
 * No lleva `parentSkuId`: el SKU padre todavía no existe cuando se manda el
 * payload, lo resuelve el alta después de crearlo.
 */
export class BundleComponentDto {
  /** SKU ya existente que entra en el combo. Es el que fija la variante:
   *  si mandás el SKU del joystick rojo, el combo viene con el rojo. */
  @IsUUID('4')
  skuId!: string;

  /** Unidades del componente por cada unidad del combo. Default 1. */
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  /** Hoy sólo `fixed`: ver `assertBundleIsValid`. */
  @IsOptional()
  @IsEnum(ComponentSelectionMode)
  mode?: ComponentSelectionMode;

  /** Si al vender el combo se descuenta stock de este componente. Default true. */
  @IsOptional()
  @IsBoolean()
  stockReduce?: boolean;
}
