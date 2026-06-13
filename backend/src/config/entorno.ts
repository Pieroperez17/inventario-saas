/**
 * Carga y validación de variables de entorno.
 * Si falta alguna variable obligatoria o tiene formato inválido, el proceso
 * se detiene con un mensaje claro (fail-fast).
 */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const esquemaEntorno = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  JWT_ACCESO_SECRETO: z
    .string()
    .min(10, 'JWT_ACCESO_SECRETO debe tener al menos 10 caracteres'),
  JWT_ACCESO_EXPIRA: z.string().default('15m'),
  JWT_REFRESH_SECRETO: z
    .string()
    .min(10, 'JWT_REFRESH_SECRETO debe tener al menos 10 caracteres'),
  JWT_REFRESH_EXPIRA: z.string().default('7d'),
  CORS_ORIGEN: z.string().default('http://localhost:5173'),
  ZONA_HORARIA: z.string().default('America/Lima'),
  LIMITE_PETICIONES: z.coerce.number().int().positive().default(300),
  LIMITE_VENTANA_MINUTOS: z.coerce.number().int().positive().default(15),
});

const resultado = esquemaEntorno.safeParse(process.env);

if (!resultado.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variables de entorno inválidas:');
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(resultado.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const datos = resultado.data;

export const entorno = {
  ...datos,
  esProduccion: datos.NODE_ENV === 'production',
  esDesarrollo: datos.NODE_ENV === 'development',
  esPrueba: datos.NODE_ENV === 'test',
  /** Lista de orígenes permitidos por CORS. */
  corsOrigenes: datos.CORS_ORIGEN.split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
};

export type Entorno = typeof entorno;
