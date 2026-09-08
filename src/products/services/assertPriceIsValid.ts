import { BadRequestException } from '@nestjs/common';

/** El precio con descuento tiene que ser menor al precio de lista. */
export function assertPriceIsValid(
  price: number,
  discountedPrice: number | undefined,
  label: string,
) {
  if (discountedPrice !== undefined && discountedPrice >= price) {
    throw new BadRequestException(
      `El precio con descuento de ${label} tiene que ser menor al precio`,
    );
  }
}
