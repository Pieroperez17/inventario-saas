/**
 * Esquemas de validación de productos.
 */
import { z } from 'zod';

export const esquemaCrearProducto = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio').max(50),
  nombre: z.string().min(2, 'El nombre es obligatorio').max(150),
  descripcion: z.string().max(500).nullable().optional(),
  categoriaId: z.string().min(1).nullable().optional(),
  unidadMedida: z.string().min(1).max(30).default('UNIDAD'),
  precioCompra: z.number().nonnegative('Debe ser ≥ 0').default(0),
  precioVenta: z.number().nonnegative('Debe ser ≥ 0').default(0),
  stockMinimo: z.number().nonnegative('Debe ser ≥ 0').default(0),
});

export const esquemaActualizarProducto = esquemaCrearProducto.partial().extend({
  activo: z.boolean().optional(),
});

export type EntradaCrearProducto = z.infer<typeof esquemaCrearProducto>;
export type EntradaActualizarProducto = z.infer<typeof esquemaActualizarProducto>;
