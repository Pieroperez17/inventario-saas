/**
 * Servicio de auditoría: registra en la bitácora quién hizo qué y cuándo.
 * Nunca lanza: si falla el registro, solo se loguea (no debe romper la acción).
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { logger } from '../utilidades/logger';
import { ParametrosListado } from '../utilidades/paginacion';

interface DatosAuditoria {
  empresaId: string;
  usuarioId?: string | null;
  accion: string; // CREAR, ACTUALIZAR, ELIMINAR, LOGIN, ...
  entidad: string; // Producto, Usuario, ...
  entidadId?: string | null;
  detalles?: unknown;
  ip?: string | null;
}

export async function registrarAuditoria(datos: DatosAuditoria): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      empresaId: datos.empresaId,
      usuarioId: datos.usuarioId ?? null,
      accion: datos.accion,
      entidad: datos.entidad,
      entidadId: datos.entidadId ?? null,
      ip: datos.ip ?? null,
    };
    if (datos.detalles !== undefined) data.detalles = datos.detalles;
    await prisma.registroAuditoria.create({ data });
  } catch (error) {
    logger.error('No se pudo registrar la auditoría:', error);
  }
}

interface FiltrosAuditoria extends ParametrosListado {
  entidad?: string;
  accion?: string;
  usuarioId?: string;
  desde?: Date;
  hasta?: Date;
}

/** Listado de la bitácora de auditoría (solo Administrador). */
export async function listarAuditoria(empresaId: string, params: FiltrosAuditoria) {
  const where: Prisma.RegistroAuditoriaWhereInput = { empresaId };
  if (params.entidad) where.entidad = params.entidad;
  if (params.accion) where.accion = params.accion;
  if (params.usuarioId) where.usuarioId = params.usuarioId;
  if (params.desde || params.hasta) {
    where.creadoEn = {};
    if (params.desde) where.creadoEn.gte = params.desde;
    if (params.hasta) where.creadoEn.lte = params.hasta;
  }
  if (params.buscar) {
    where.OR = [
      { entidad: { contains: params.buscar, mode: 'insensitive' } },
      { accion: { contains: params.buscar, mode: 'insensitive' } },
    ];
  }

  const [datos, total] = await prisma.$transaction([
    prisma.registroAuditoria.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      skip: params.saltar,
      take: params.limite,
      include: { usuario: { select: { id: true, nombres: true, apellidos: true, email: true } } },
    }),
    prisma.registroAuditoria.count({ where }),
  ]);
  return { datos, total };
}
