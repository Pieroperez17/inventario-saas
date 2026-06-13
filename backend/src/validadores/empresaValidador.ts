/**
 * Esquemas de validación de la empresa (tenant).
 */
import { z } from 'zod';

export const esquemaActualizarEmpresa = z.object({
  razonSocial: z.string().min(2).max(150).optional(),
  direccion: z.string().max(200).nullable().optional(),
  telefono: z.string().max(30).nullable().optional(),
  email: z.string().email('Email inválido').optional(),
  logo: z.string().max(500).nullable().optional(),
  moneda: z.string().min(3).max(3).optional(),
  zonaHoraria: z.string().min(3).max(60).optional(),
});

export type EntradaActualizarEmpresa = z.infer<typeof esquemaActualizarEmpresa>;
