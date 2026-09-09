import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductType } from '../entities';
import { BundleComponentDto } from '../product-component/dto/product-component.dto';

/** Una opción suelta dentro de una combinación: "Talle" / "M". */
export class VariantOptionDto {
  @IsString()
  @Length(1, 80)
  name!: string;

  @IsString()
  @Length(1, 120)
  value!: string;
}

export class VariantCombinationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantOptionDto)
  variant!: VariantOptionDto[];

  /** En un combo se ignora: el stock sale de los componentes. */
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountedPrice?: number;

  /** Código propio del SKU. Si no va, se genera con el nombre y las opciones. */
  @IsOptional()
  @IsString()
  @Length(1, 64)
  code?: string;

  /**
   * Sólo en combos: qué SKUs trae *esta* combinación, además de los comunes
   * del producto. Es lo que hace "elegible" un combo desde el catálogo:
   * una combinación por color de joystick, cada una apuntando al SKU de ese
   * color. Si repite un `skuId` de los comunes, gana el de acá.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BundleComponentDto)
  components?: BundleComponentDto[];
}

export class ProductDto {
  @IsString()
  @Length(2, 200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl(
    { require_tld: false },
    { each: true, message: 'Url de imagen inválida' },
  )
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantCombinationDto)
  variants?: VariantCombinationDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  /** En un combo se ignora: el stock sale de los componentes. */
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountedPrice?: number;

  /**
   * Sólo en combos (`type: "bundle"`): los SKUs que integran el combo y que
   * son comunes a todos sus SKUs. Si además hay `variants`, cada combinación
   * puede sumar o pisar componentes.
   *
   * Alcanza con mandarlos para que el `type` se resuelva a `bundle`.
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BundleComponentDto)
  components?: BundleComponentDto[];
}
