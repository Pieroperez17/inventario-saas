/**
 * Esquemas de validación de proveedores.
 */
import { z } from 'zod';

export const esquemaCrearProveedor = z.object({
  razonSocial: z.string().min(2, 'La razón social es obligatoria').max(150),
  ruc: z.string().max(20).nullable().optional(),
  contacto: z.string().max(120).nullable().optional(),
  telefono: z.string().max(30).nullable().optional(),
  email: z.string().email('Email inválido').nullable().optional().or(z.literal('')),
  direccion: z.string().max(200).nullable().optional(),
});

export const esquemaActualizarProveedor = esquemaCrearProveedor.partial().extend({
  activo: z.boolean().optional(),
});

export const esquemaAsociarProductos = z.object({
  productoIds: z.array(z.string().min(1)),
});

export type EntradaCrearProveedor = z.infer<typeof esquemaCrearProveedor>;
export type EntradaActualizarProveedor = z.infer<typeof esquemaActualizarProveedor>;
