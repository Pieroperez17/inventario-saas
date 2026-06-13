/**
 * Lógica de negocio de movimientos de inventario. Cada movimiento ajusta el
 * stock de forma transaccional:
 *   - ENTRADA: incrementa el stock en el destino.
 *   - SALIDA: decrementa el stock en el origen (valida que haya suficiente).
 *   - TRANSFERENCIA: decrementa en origen e incrementa en destino (atómico).
 */
import { Prisma, TipoMovimiento, TipoUbicacion } from '@prisma/client';
import { prisma } from '../config/baseDatos';
import { ErrorAplicacion } from '../utilidades/errores';
import { registrarAuditoria } from './auditoriaServicio';
import { crearResolvedorUbicaciones } from './inventarioServicio';
import { notificarPorRoles } from './notificacionServicio';
import { ROLES } from '../config/constantes';
import { ParametrosListado } from '../utilidades/paginacion';
import { EntradaMovimiento } from '../validadores/movimientoValidador';

interface FiltrosMovimiento extends ParametrosListado {
  tipo?: TipoMovimiento;
  productoId?: string;
  ubicacionId?: string;
  desde?: Date;
  hasta?: Date;
}

async function validarUbicacion(empresaId: string, tipo: TipoUbicacion, id: string): Promise<void> {
  const existe =
    tipo === TipoUbicacion.ALMACEN
      ? await prisma.almacen.findFirst({ where: { id, empresaId } })
      : await prisma.tienda.findFirst({ where: { id, empresaId } });
  if (!existe) throw ErrorAplicacion.validacion('La ubicación indicada no existe en tu empresa.');
}

/** Ajusta (crea o actualiza) la fila de inventario de una ubicación. */
async function ajustarStock(
  tx: Prisma.TransactionClient,
  empresaId: string,
  productoId: string,
  tipo: TipoUbicacion,
  ubicacionId: string,
  delta: number,
): Promise<void> {
  const inventario = await tx.inventario.findUnique({
    where: { productoId_ubicacionTipo_ubicacionId: { productoId, ubicacionTipo: tipo, ubicacionId } },
  });
  const actual = inventario ? Number(inventario.cantidad) : 0;
  const nuevo = actual + delta;
  if (nuevo < 0) {
    throw ErrorAplicacion.conflicto('Stock insuficiente en la ubicación de origen.');
  }
  if (inventario) {
    await tx.inventario.update({ where: { id: inventario.id }, data: { cantidad: nuevo } });
  } else {
    await tx.inventario.create({
      data: { empresaId, productoId, ubicacionTipo: tipo, ubicacionId, cantidad: nuevo },
    });
  }
}

type ResolvedorUbicaciones = (tipo: TipoUbicacion | null, id: string | null) => string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatearMovimiento(m: any, resolver: ResolvedorUbicaciones) {
  return {
    id: m.id,
    tipo: m.tipo,
    cantidad: Number(m.cantidad),
    motivo: m.motivo,
    fecha: m.fecha,
    producto: m.producto,
    usuario: m.usuario ? `${m.usuario.nombres} ${m.usuario.apellidos}` : null,
    proveedor: m.proveedor?.razonSocial ?? null,
    origen:
      m.origenTipo && m.origenId
        ? { tipo: m.origenTipo, id: m.origenId, nombre: resolver(m.origenTipo, m.origenId) }
        : null,
    destino:
      m.destinoTipo && m.destinoId
        ? { tipo: m.destinoTipo, id: m.destinoId, nombre: resolver(m.destinoTipo, m.destinoId) }
        : null,
  };
}

const INCLUIR = {
  producto: { select: { id: true, sku: true, nombre: true, unidadMedida: true } },
  usuario: { select: { id: true, nombres: true, apellidos: true } },
  proveedor: { select: { id: true, razonSocial: true } },
} satisfies Prisma.MovimientoInventarioInclude;

export async function registrarMovimiento(
  empresaId: string,
  datos: EntradaMovimiento,
  actorId: string,
  ip?: string,
) {
  const producto = await prisma.producto.findFirst({ where: { id: datos.productoId, empresaId } });
  if (!producto) throw ErrorAplicacion.validacion('El producto no existe en tu empresa.');

  if (datos.proveedorId) {
    const proveedor = await prisma.proveedor.findFirst({ where: { id: datos.proveedorId, empresaId } });
    if (!proveedor) throw ErrorAplicacion.validacion('El proveedor indicado no existe.');
  }

  if (datos.origen) await validarUbicacion(empresaId, datos.origen.tipo, datos.origen.id);
  if (datos.destino) await validarUbicacion(empresaId, datos.destino.tipo, datos.destino.id);

  const creado = await prisma.$transaction(async (tx) => {
    if (datos.tipo === 'ENTRADA') {
      await ajustarStock(tx, empresaId, datos.productoId, datos.destino!.tipo, datos.destino!.id, datos.cantidad);
    } else if (datos.tipo === 'SALIDA') {
      await ajustarStock(tx, empresaId, datos.productoId, datos.origen!.tipo, datos.origen!.id, -datos.cantidad);
    } else {
      await ajustarStock(tx, empresaId, datos.productoId, datos.origen!.tipo, datos.origen!.id, -datos.cantidad);
      await ajustarStock(tx, empresaId, datos.productoId, datos.destino!.tipo, datos.destino!.id, datos.cantidad);
    }

    return tx.movimientoInventario.create({
      data: {
        empresaId,
        tipo: datos.tipo,
        productoId: datos.productoId,
        cantidad: datos.cantidad,
        motivo: datos.motivo ?? null,
        proveedorId: datos.proveedorId ?? null,
        usuarioId: actorId,
        origenTipo: datos.origen?.tipo ?? null,
        origenId: datos.origen?.id ?? null,
        destinoTipo: datos.destino?.tipo ?? null,
        destinoId: datos.destino?.id ?? null,
      },
      include: INCLUIR,
    });
  });

  await registrarAuditoria({
    empresaId,
    usuarioId: actorId,
    accion: datos.tipo,
    entidad: 'MovimientoInventario',
    entidadId: creado.id,
    ip,
  });

  await generarNotificaciones(empresaId, datos, producto, actorId);

  const resolver = await crearResolvedorUbicaciones(empresaId);
  return formatearMovimiento(creado, resolver);
}

/** Genera notificaciones derivadas de un movimiento (no bloqueantes). */
async function generarNotificaciones(
  empresaId: string,
  datos: EntradaMovimiento,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  producto: any,
  actorId: string,
): Promise<void> {
  if (datos.tipo === 'TRANSFERENCIA') {
    await notificarPorRoles(
      empresaId,
      [ROLES.ADMINISTRADOR, ROLES.EDITOR],
      {
        tipo: 'TRANSFERENCIA',
        titulo: 'Transferencia registrada',
        mensaje: `Se transfirieron ${datos.cantidad} unidades de ${producto.nombre}.`,
      },
      actorId,
    );
  }

  if (datos.tipo === 'SALIDA' || datos.tipo === 'TRANSFERENCIA') {
    const agregado = await prisma.inventario.aggregate({
      where: { productoId: datos.productoId },
      _sum: { cantidad: true },
    });
    const total = Number(agregado._sum.cantidad ?? 0);
    if (total < Number(producto.stockMinimo)) {
      await notificarPorRoles(empresaId, [ROLES.ADMINISTRADOR, ROLES.EDITOR], {
        tipo: 'STOCK_MINIMO',
        titulo: 'Stock por debajo del mínimo',
        mensaje: `${producto.nombre} quedó en ${total} (mínimo ${Number(producto.stockMinimo)}).`,
      });
    }
  }
}

export async function listarMovimientos(empresaId: string, params: FiltrosMovimiento) {
  const where: Prisma.MovimientoInventarioWhereInput = { empresaId };
  const and: Prisma.MovimientoInventarioWhereInput[] = [];

  if (params.tipo) where.tipo = params.tipo;
  if (params.productoId) where.productoId = params.productoId;
  if (params.ubicacionId) {
    and.push({ OR: [{ origenId: params.ubicacionId }, { destinoId: params.ubicacionId }] });
  }
  if (params.desde || params.hasta) {
    where.fecha = {};
    if (params.desde) where.fecha.gte = params.desde;
    if (params.hasta) where.fecha.lte = params.hasta;
  }
  if (params.buscar) {
    and.push({
      producto: {
        OR: [
          { sku: { contains: params.buscar, mode: 'insensitive' } },
          { nombre: { contains: params.buscar, mode: 'insensitive' } },
        ],
      },
    });
  }
  if (and.length) where.AND = and;

  const [registros, total] = await prisma.$transaction([
    prisma.movimientoInventario.findMany({
      where,
      skip: params.saltar,
      take: params.limite,
      orderBy: { fecha: params.orden },
      include: INCLUIR,
    }),
    prisma.movimientoInventario.count({ where }),
  ]);

  const resolver = await crearResolvedorUbicaciones(empresaId);
  return { datos: registros.map((m) => formatearMovimiento(m, resolver)), total };
}
