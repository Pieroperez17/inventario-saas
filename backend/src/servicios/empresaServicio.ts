/**
 * Lógica de negocio de la empresa (datos del tenant y su configuración).
 */
import { prisma } from '../config/baseDatos';
import { registrarAuditoria } from './auditoriaServicio';
import { EntradaActualizarEmpresa } from '../validadores/empresaValidador';

export async function obtenerEmpresa(empresaId: string) {
  return prisma.empresa.findUniqueOrThrow({ where: { id: empresaId } });
}

export async function actualizarEmpresa(
  empresaId: string,
  datos: EntradaActualizarEmpresa,
  usuarioId: string,
) {
  const empresa = await prisma.empresa.update({ where: { id: empresaId }, data: datos });
  await registrarAuditoria({
    empresaId,
    usuarioId,
    accion: 'ACTUALIZAR',
    entidad: 'Empresa',
    entidadId: empresaId,
    detalles: datos,
  });
  return empresa;
}
