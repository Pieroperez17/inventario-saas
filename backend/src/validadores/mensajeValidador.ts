/**
 * Esquema de validación de mensajería interna.
 */
import { z } from 'zod';

export const esquemaEnviarMensaje = z.object({
  destinatarioId: z.string().min(1, 'El destinatario es obligatorio'),
  asunto: z.string().max(150).nullable().optional(),
  cuerpo: z.string().min(1, 'El mensaje no puede estar vacío').max(4000),
});

export type EntradaEnviarMensaje = z.infer<typeof esquemaEnviarMensaje>;
