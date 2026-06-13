/**
 * Cliente único (singleton) de Prisma.
 * En desarrollo se reutiliza la instancia para evitar agotar el pool de
 * conexiones por el hot-reload.
 */
import { PrismaClient } from '@prisma/client';
import { entorno } from './entorno';

const almacenGlobal = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  almacenGlobal.prisma ??
  new PrismaClient({
    log: entorno.esDesarrollo ? ['warn', 'error'] : ['error'],
  });

if (!entorno.esProduccion) {
  almacenGlobal.prisma = prisma;
}

/** Abre la conexión con la base de datos (verificación al arrancar). */
export async function conectarBaseDatos(): Promise<void> {
  await prisma.$connect();
}

/** Cierra la conexión con la base de datos (apagado ordenado). */
export async function desconectarBaseDatos(): Promise<void> {
  await prisma.$disconnect();
}
