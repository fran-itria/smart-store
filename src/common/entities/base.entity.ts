import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base para todas las entidades del dominio.
 *
 * Aporta id uuid + timestamps + soft delete. Extenderla en vez de repetir
 * estas columnas:
 *
 *   @Entity('productos')
 *   export class Producto extends BaseEntity { ... }
 *
 * El soft delete (`deletedAt`) hace que `repo.softRemove()` / `repo.softDelete()`
 * marquen la fila en lugar de borrarla, y que los `find` la excluyan solos.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
