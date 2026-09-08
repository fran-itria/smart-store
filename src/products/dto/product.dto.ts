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

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountedPrice?: number;
}
