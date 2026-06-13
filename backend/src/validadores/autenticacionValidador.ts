/**
 * Esquemas de validación (Zod) del subsistema de autenticación.
 */
import { z } from 'zod';

export const esquemaRegistroEmpresa = z.object({
  empresa: z.object({
    razonSocial: z.string().min(2, 'La razón social es obligatoria').max(150),
    ruc: z.string().regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos'),
    direccion: z.string().max(200).optional(),
    telefono: z.string().max(30).optional(),
    email: z.string().email('Email de empresa inválido'),
    moneda: z.string().default('PEN'),
    zonaHoraria: z.string().default('America/Lima'),
  }),
  administrador: z.object({
    nombres: z.string().min(2, 'Los nombres son obligatorios').max(80),
    apellidos: z.string().min(2, 'Los apellidos son obligatorios').max(80),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(72, 'La contraseña no puede superar 72 caracteres'),
  }),
});

export const esquemaLogin = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const esquemaRefresh = z.object({
  refreshToken: z.string().min(10, 'Refresh token inválido'),
});

export const esquemaCambioContrasena = z.object({
  actual: z.string().min(1, 'La contraseña actual es obligatoria'),
  nueva: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres'),
});

export type EntradaRegistroEmpresa = z.infer<typeof esquemaRegistroEmpresa>;
