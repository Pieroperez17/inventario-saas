/**
 * Controlador de almacenes.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/almacenServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.listarAlmacenes(req.usuario!.empresaId, params);
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const obtener = manejarAsync(async (req, res) => {
  responderExito(res, { datos: await servicio.obtenerAlmacen(req.usuario!.empresaId, req.params.id) });
});

export const crear = manejarAsync(async (req, res) => {
  const almacen = await servicio.crearAlmacen(req.usuario!.empresaId, req.body, req.usuario!.id);
  responderExito(res, { estado: 201, mensaje: 'Almacén creado.', datos: almacen });
});

export const actualizar = manejarAsync(async (req, res) => {
  const almacen = await servicio.actualizarAlmacen(req.usuario!.empresaId, req.params.id, req.body, req.usuario!.id);
  responderExito(res, { mensaje: 'Almacén actualizado.', datos: almacen });
});

export const eliminar = manejarAsync(async (req, res) => {
  await servicio.eliminarAlmacen(req.usuario!.empresaId, req.params.id, req.usuario!.id);
  responderExito(res, { mensaje: 'Almacén eliminado.' });
});
