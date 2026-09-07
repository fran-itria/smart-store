import { ValueTransformer } from 'typeorm';

/**
 * Postgres devuelve `numeric` como string para no perder precisión.
 * Este transformer lo normaliza a `number` al leer, y deja que el driver
 * serialice al escribir.
 *
 *   @Column({ type: 'numeric', precision: 12, scale: 2, transformer: decimalTransformer })
 *   price!: number;
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value ?? null,
  from: (value?: string | null) =>
    value === null || value === undefined ? null : Number(value),
};
