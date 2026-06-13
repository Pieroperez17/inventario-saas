/**
 * Esquemas de validación de usuarios.
 */
import { z } from 'zod';

const rolEnum = z.enum(['Administrador', 'Editor', 'Visualizador']);

export const esquemaCrearUsuario = z.object({
  nombres: z.string().min(2).max(80),
  apellidos: z.string().min(2).max(80),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  rol: rolEnum,
});

export const esquemaActualizarUsuario = z.object({
  nombres: z.string().min(2).max(80).optional(),
  apellidos: z.string().min(2).max(80).optional(),
  rol: rolEnum.optional(),
  activo: z.boolean().optional(),
});

export const esquemaEstadoUsuario = z.object({
  activo: z.boolean(),
});

export const esquemaRestablecerContrasena = z.object({
  nueva: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});

export type EntradaCrearUsuario = z.infer<typeof esquemaCrearUsuario>;
export type EntradaActualizarUsuario = z.infer<typeof esquemaActualizarUsuario>;
