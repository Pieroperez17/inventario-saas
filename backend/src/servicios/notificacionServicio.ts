/**
 * Notificaciones del sistema (badge de no leídas, marcar como leídas, y
 * generación programática desde otros servicios).
 */
import { Prisma, TipoNotificacion } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { ParametrosListado } from '../utilidades/paginacion';
import { logger } from '../utilidades/logger';

interface NuevaNotificacion {
  tipo?: TipoNotificacion;
  titulo: string;
  mensaje: string;
  datos?: unknown;
}

export async function crearNotificacion(empresaId: string, usuarioId: string, n: NuevaNotificacion) {
  return prisma.notificacion.create({
    data: {
      empresaId,
      usuarioId,
      tipo: n.tipo ?? 'GENERAL',
      titulo: n.titulo,
      mensaje: n.mensaje,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datos: (n.datos ?? undefined) as any,
    },
  });
}

/** Crea la misma notificación para todos los usuarios activos de ciertos roles. */
export async function notificarPorRoles(
  empresaId: string,
  roles: string[],
  n: NuevaNotificacion,
  excluirUsuarioId?: string,
): Promise<void> {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        empresaId,
        activo: true,
        rol: { nombre: { in: roles } },
        ...(excluirUsuarioId ? { id: { not: excluirUsuarioId } } : {}),
      },
      select: { id: true },
    });
    if (usuarios.length === 0) return;
    await prisma.notificacion.createMany({
      data: usuarios.map((u) => ({
        empresaId,
        usuarioId: u.id,
        tipo: n.tipo ?? 'GENERAL',
        titulo: n.titulo,
        mensaje: n.mensaje,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        datos: (n.datos ?? undefined) as any,
      })),
    });
  } catch (error) {
    // Las notificaciones nunca deben romper la operación principal.
    logger.error('No se pudieron crear notificaciones por rol:', error);
  }
}

export async function listarNotificaciones(
  empresaId: string,
  usuarioId: string,
  params: ParametrosListado & { soloNoLeidas?: boolean },
) {
  const where: Prisma.NotificacionWhereInput = { empresaId, usuarioId };
  if (params.soloNoLeidas) where.leida = false;

  const [datos, total, noLeidas] = await prisma.$transaction([
    prisma.notificacion.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      skip: params.saltar,
      take: params.limite,
    }),
    prisma.notificacion.count({ where }),
    prisma.notificacion.count({ where: { empresaId, usuarioId, leida: false } }),
  ]);
  return { datos, total, noLeidas };
}

export async function contarNoLeidas(empresaId: string, usuarioId: string) {
  return prisma.notificacion.count({ where: { empresaId, usuarioId, leida: false } });
}

export async function marcarLeida(empresaId: string, usuarioId: string, id: string) {
  const resultado = await prisma.notificacion.updateMany({
    where: { id, empresaId, usuarioId },
    data: { leida: true, leidaEn: new Date() },
  });
  if (resultado.count === 0) throw ErrorAplicacion.noEncontrado('Notificación no encontrada.');
}

export async function marcarTodasLeidas(empresaId: string, usuarioId: string) {
  await prisma.notificacion.updateMany({
    where: { empresaId, usuarioId, leida: false },
    data: { leida: true, leidaEn: new Date() },
  });
}
