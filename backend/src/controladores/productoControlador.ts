/**
 * Controlador de productos.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/productoServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const categoriaId = req.query.categoriaId ? String(req.query.categoriaId) : undefined;
  const activo = req.query.activo === undefined ? undefined : String(req.query.activo) === 'true';

  const { datos, total } = await servicio.listarProductos(req.usuario!.empresaId, {
    ...params,
    categoriaId,
    activo,
  });
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const obtener = manejarAsync(async (req, res) => {
  responderExito(res, { datos: await servicio.obtenerProducto(req.usuario!.empresaId, req.params.id) });
});

export const crear = manejarAsync(async (req, res) => {
  const producto = await servicio.crearProducto(req.usuario!.empresaId, req.body, req.usuario!.id);
  responderExito(res, { estado: 201, mensaje: 'Producto creado.', datos: producto });
});

export const actualizar = manejarAsync(async (req, res) => {
  const producto = await servicio.actualizarProducto(req.usuario!.empresaId, req.params.id, req.body, req.usuario!.id);
  responderExito(res, { mensaje: 'Producto actualizado.', datos: producto });
});

export const eliminar = manejarAsync(async (req, res) => {
  await servicio.eliminarProducto(req.usuario!.empresaId, req.params.id, req.usuario!.id);
  responderExito(res, { mensaje: 'Producto eliminado.' });
});
