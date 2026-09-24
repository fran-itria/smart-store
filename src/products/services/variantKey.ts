/**
 * Firma de una combinación de opciones, independiente del orden y de
 * mayúsculas: `[Color: Rojo, Talle: M]` -> `color=rojo|talle=m`.
 * Una lista vacía (el SKU de un producto simple) da `''`.
 */
export const variantKey = (options: { name: string; value: string }[]) =>
  options
    .map(
      (o) => `${o.name.trim().toLowerCase()}=${o.value.trim().toLowerCase()}`,
    )
    .sort()
    .join('|');
