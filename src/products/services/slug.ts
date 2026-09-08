/** Normaliza un texto para meterlo en un `code`: "Remera Ñandú" -> "REMERA-NANDU". */
export const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
