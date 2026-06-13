/**
 * Controlador de proveedores.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/proveedorServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.listarProveedores(req.usuario!.empresaId, params);
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const obtener = manejarAsync(async (req, res) => {
  responderExito(res, { datos: await servicio.obtenerProveedor(req.usuario!.empresaId, req.params.id) });
});

export const crear = manejarAsync(async (req, res) => {
  const proveedor = await servicio.crearProveedor(req.usuario!.empresaId, req.body, req.usuario!.id);
  responderExito(res, { estado: 201, mensaje: 'Proveedor creado.', datos: proveedor });
});

export const actualizar = manejarAsync(async (req, res) => {
  const proveedor = await servicio.actualizarProveedor(req.usuario!.empresaId, req.params.id, req.body, req.usuario!.id);
  responderExito(res, { mensaje: 'Proveedor actualizado.', datos: proveedor });
});

export const eliminar = manejarAsync(async (req, res) => {
  await servicio.eliminarProveedor(req.usuario!.empresaId, req.params.id, req.usuario!.id);
  responderExito(res, { mensaje: 'Proveedor eliminado.' });
});

export const asociarProductos = manejarAsync(async (req, res) => {
  const proveedor = await servicio.establecerProductos(
    req.usuario!.empresaId,
    req.params.id,
    req.body.productoIds,
    req.usuario!.id,
  );
  responderExito(res, { mensaje: 'Productos asociados.', datos: proveedor });
});
