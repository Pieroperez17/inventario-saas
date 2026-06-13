/**
 * Inicialización idempotente de los catálogos del sistema: roles y permisos
 * y sus asignaciones. Se ejecuta al arrancar la API (garantiza que el registro
 * de empresas pueda asignar el rol Administrador, exista o no el seed demo).
 */
import { PrismaClient } from '@prisma/client';
import {
  ROLES,
  DESCRIPCION_ROLES,
  CATALOGO_PERMISOS,
  PERMISOS_POR_ROL,
  NombreRol,
} from '../config/constantes';

export async function inicializarCatalogos(cliente: PrismaClient): Promise<void> {
  // Roles del sistema
  for (const nombre of Object.values(ROLES)) {
    await cliente.rol.upsert({
      where: { nombre },
      update: { descripcion: DESCRIPCION_ROLES[nombre] },
      create: { nombre, descripcion: DESCRIPCION_ROLES[nombre], esSistema: true },
    });
  }

  // Catálogo de permisos
  for (const permiso of CATALOGO_PERMISOS) {
    await cliente.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: { modulo: permiso.modulo, descripcion: permiso.descripcion },
      create: permiso,
    });
  }

  // Asignaciones rol → permisos
  const permisos = await cliente.permiso.findMany();
  const mapaPermisos = new Map(permisos.map((p) => [p.codigo, p.id]));

  for (const nombre of Object.values(ROLES)) {
    const rol = await cliente.rol.findUniqueOrThrow({ where: { nombre } });
    const asignacion = PERMISOS_POR_ROL[nombre as NombreRol];
    const codigos = asignacion === '*' ? CATALOGO_PERMISOS.map((p) => p.codigo) : asignacion;

    await cliente.rolPermiso.deleteMany({ where: { rolId: rol.id } });
    await cliente.rolPermiso.createMany({
      data: codigos
        .map((codigo) => mapaPermisos.get(codigo))
        .filter((id): id is string => Boolean(id))
        .map((permisoId) => ({ rolId: rol.id, permisoId })),
      skipDuplicates: true,
    });
  }
}
