/**
 * Esquemas de validación compartidos por almacenes y tiendas (misma forma).
 */
import { z } from 'zod';

export const esquemaCrearUbicacion = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio').max(120),
  direccion: z.string().max(200).nullable().optional(),
  responsable: z.string().max(120).nullable().optional(),
  telefono: z.string().max(30).nullable().optional(),
});

export const esquemaActualizarUbicacion = esquemaCrearUbicacion.partial().extend({
  activo: z.boolean().optional(),
});

export type EntradaCrearUbicacion = z.infer<typeof esquemaCrearUbicacion>;
export type EntradaActualizarUbicacion = z.infer<typeof esquemaActualizarUbicacion>;
