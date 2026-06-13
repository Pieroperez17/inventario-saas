/**
 * Mensajería interna entre usuarios de una misma empresa.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { ParametrosListado } from '../utilidades/paginacion';
import { crearNotificacion } from './notificacionServicio';
import { EntradaEnviarMensaje } from '../validadores/mensajeValidador';

const INCLUIR = {
  remitente: { select: { id: true, nombres: true, apellidos: true, email: true } },
  destinatario: { select: { id: true, nombres: true, apellidos: true, email: true } },
} satisfies Prisma.MensajeInclude;

export async function enviarMensaje(empresaId: string, remitenteId: string, datos: EntradaEnviarMensaje) {
  if (datos.destinatarioId === remitenteId) {
    throw ErrorAplicacion.validacion('No puedes enviarte un mensaje a ti mismo.');
  }
  const destinatario = await prisma.usuario.findFirst({
    where: { id: datos.destinatarioId, empresaId, activo: true },
  });
  if (!destinatario) throw ErrorAplicacion.validacion('El destinatario no existe en tu empresa.');

  const mensaje = await prisma.mensaje.create({
    data: {
      empresaId,
      remitenteId,
      destinatarioId: datos.destinatarioId,
      asunto: datos.asunto ?? null,
      cuerpo: datos.cuerpo,
    },
    include: INCLUIR,
  });

  await crearNotificacion(empresaId, datos.destinatarioId, {
    tipo: 'MENSAJE',
    titulo: 'Nuevo mensaje',
    mensaje: datos.asunto || 'Has recibido un mensaje interno.',
    datos: { mensajeId: mensaje.id },
  });

  return mensaje;
}

export async function bandejaEntrada(empresaId: string, usuarioId: string, params: ParametrosListado) {
  const where: Prisma.MensajeWhereInput = { empresaId, destinatarioId: usuarioId };
  const [datos, total, noLeidos] = await prisma.$transaction([
    prisma.mensaje.findMany({ where, orderBy: { creadoEn: 'desc' }, skip: params.saltar, take: params.limite, include: INCLUIR }),
    prisma.mensaje.count({ where }),
    prisma.mensaje.count({ where: { empresaId, destinatarioId: usuarioId, leido: false } }),
  ]);
  return { datos, total, noLeidos };
}

export async function enviados(empresaId: string, usuarioId: string, params: ParametrosListado) {
  const where: Prisma.MensajeWhereInput = { empresaId, remitenteId: usuarioId };
  const [datos, total] = await prisma.$transaction([
    prisma.mensaje.findMany({ where, orderBy: { creadoEn: 'desc' }, skip: params.saltar, take: params.limite, include: INCLUIR }),
    prisma.mensaje.count({ where }),
  ]);
  return { datos, total };
}

export async function obtenerMensaje(empresaId: string, usuarioId: string, id: string) {
  const mensaje = await prisma.mensaje.findFirst({
    where: { id, empresaId, OR: [{ remitenteId: usuarioId }, { destinatarioId: usuarioId }] },
    include: INCLUIR,
  });
  if (!mensaje) throw ErrorAplicacion.noEncontrado('Mensaje no encontrado.');

  // Si el lector es el destinatario y no estaba leído, se marca como leído.
  if (mensaje.destinatarioId === usuarioId && !mensaje.leido) {
    await prisma.mensaje.update({ where: { id }, data: { leido: true, leidoEn: new Date() } });
    mensaje.leido = true;
  }
  return mensaje;
}

export async function marcarLeido(empresaId: string, usuarioId: string, id: string) {
  const resultado = await prisma.mensaje.updateMany({
    where: { id, empresaId, destinatarioId: usuarioId },
    data: { leido: true, leidoEn: new Date() },
  });
  if (resultado.count === 0) throw ErrorAplicacion.noEncontrado('Mensaje no encontrado.');
}

export async function contarNoLeidos(empresaId: string, usuarioId: string) {
  return prisma.mensaje.count({ where: { empresaId, destinatarioId: usuarioId, leido: false } });
}

/** Lista de colegas a quienes se puede enviar un mensaje (todos los roles). */
export async function listarContactos(empresaId: string, exceptoId: string) {
  return prisma.usuario.findMany({
    where: { empresaId, activo: true, id: { not: exceptoId } },
    select: { id: true, nombres: true, apellidos: true, email: true, rol: { select: { nombre: true } } },
    orderBy: { nombres: 'asc' },
  });
}
