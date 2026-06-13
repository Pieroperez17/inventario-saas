/**
 * Esquema de validación de movimientos de inventario.
 * Reglas por tipo: ENTRADA→destino, SALIDA→origen, TRANSFERENCIA→ambos.
 */
import { z } from 'zod';

const ubicacionSchema = z.object({
  tipo: z.enum(['ALMACEN', 'TIENDA']),
  id: z.string().min(1),
});

export const esquemaMovimiento = z
  .object({
    tipo: z.enum(['ENTRADA', 'SALIDA', 'TRANSFERENCIA']),
    productoId: z.string().min(1, 'El producto es obligatorio'),
    cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
    motivo: z.string().max(300).nullable().optional(),
    proveedorId: z.string().min(1).nullable().optional(),
    origen: ubicacionSchema.optional(),
    destino: ubicacionSchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.tipo === 'ENTRADA' && !val.destino) {
      ctx.addIssue({ code: 'custom', message: 'La entrada requiere una ubicación de destino.', path: ['destino'] });
    }
    if (val.tipo === 'SALIDA' && !val.origen) {
      ctx.addIssue({ code: 'custom', message: 'La salida requiere una ubicación de origen.', path: ['origen'] });
    }
    if (val.tipo === 'TRANSFERENCIA') {
      if (!val.origen || !val.destino) {
        ctx.addIssue({ code: 'custom', message: 'La transferencia requiere origen y destino.', path: ['origen'] });
      } else if (val.origen.tipo === val.destino.tipo && val.origen.id === val.destino.id) {
        ctx.addIssue({ code: 'custom', message: 'El origen y el destino no pueden ser iguales.', path: ['destino'] });
      }
    }
  });

export type EntradaMovimiento = z.infer<typeof esquemaMovimiento>;
