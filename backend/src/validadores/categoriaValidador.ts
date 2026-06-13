/**
 * Esquemas de validación de categorías.
 */
import { z } from 'zod';

export const esquemaCrearCategoria = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio').max(120),
  descripcion: z.string().max(300).nullable().optional(),
});

export const esquemaActualizarCategoria = esquemaCrearCategoria.partial().extend({
  activo: z.boolean().optional(),
});

export type EntradaCrearCategoria = z.infer<typeof esquemaCrearCategoria>;
export type EntradaActualizarCategoria = z.infer<typeof esquemaActualizarCategoria>;
