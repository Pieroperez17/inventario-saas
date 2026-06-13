/**
 * Controlador de categorías.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/categoriaServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await servicio.listarCategorias(req.usuario!.empresaId, params);
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const obtener = manejarAsync(async (req, res) => {
  responderExito(res, { datos: await servicio.obtenerCategoria(req.usuario!.empresaId, req.params.id) });
});

export const crear = manejarAsync(async (req, res) => {
  const categoria = await servicio.crearCategoria(req.usuario!.empresaId, req.body, req.usuario!.id);
  responderExito(res, { estado: 201, mensaje: 'Categoría creada.', datos: categoria });
});

export const actualizar = manejarAsync(async (req, res) => {
  const categoria = await servicio.actualizarCategoria(req.usuario!.empresaId, req.params.id, req.body, req.usuario!.id);
  responderExito(res, { mensaje: 'Categoría actualizada.', datos: categoria });
});

export const eliminar = manejarAsync(async (req, res) => {
  await servicio.eliminarCategoria(req.usuario!.empresaId, req.params.id, req.usuario!.id);
  responderExito(res, { mensaje: 'Categoría eliminada.' });
});
