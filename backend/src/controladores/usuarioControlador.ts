/**
 * Controlador de usuarios (gestión por el Administrador de la empresa).
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as servicio from '../servicios/usuarioServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const rol = req.query.rol ? String(req.query.rol) : undefined;
  const activo =
    req.query.activo === undefined ? undefined : String(req.query.activo) === 'true';

  const { datos, total } = await servicio.listarUsuarios(req.usuario!.empresaId, {
    ...params,
    rol,
    activo,
  });
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const obtener = manejarAsync(async (req, res) => {
  const usuario = await servicio.obtenerUsuario(req.usuario!.empresaId, req.params.id);
  responderExito(res, { datos: usuario });
});

export const crear = manejarAsync(async (req, res) => {
  const usuario = await servicio.crearUsuario(req.usuario!.empresaId, req.body, req.usuario!.id);
  responderExito(res, { estado: 201, mensaje: 'Usuario creado correctamente.', datos: usuario });
});

export const actualizar = manejarAsync(async (req, res) => {
  const usuario = await servicio.actualizarUsuario(
    req.usuario!.empresaId,
    req.params.id,
    req.body,
    req.usuario!.id,
  );
  responderExito(res, { mensaje: 'Usuario actualizado.', datos: usuario });
});

export const cambiarEstado = manejarAsync(async (req, res) => {
  const usuario = await servicio.cambiarEstadoUsuario(
    req.usuario!.empresaId,
    req.params.id,
    req.body.activo,
    req.usuario!.id,
  );
  responderExito(res, { mensaje: 'Estado del usuario actualizado.', datos: usuario });
});

export const restablecerContrasena = manejarAsync(async (req, res) => {
  await servicio.restablecerContrasena(
    req.usuario!.empresaId,
    req.params.id,
    req.body.nueva,
    req.usuario!.id,
  );
  responderExito(res, { mensaje: 'Contraseña restablecida.' });
});
