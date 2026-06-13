/**
 * Controlador de notificaciones del usuario autenticado.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as srv from '../servicios/notificacionServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const soloNoLeidas = String(req.query.soloNoLeidas) === 'true';
  const { datos, total, noLeidas } = await srv.listarNotificaciones(
    req.usuario!.empresaId,
    req.usuario!.id,
    { ...params, soloNoLeidas },
  );
  responderExito(res, {
    datos,
    meta: { ...construirMeta(total, params.pagina, params.limite), noLeidas },
  });
});

export const contarNoLeidas = manejarAsync(async (req, res) => {
  const noLeidas = await srv.contarNoLeidas(req.usuario!.empresaId, req.usuario!.id);
  responderExito(res, { datos: { noLeidas } });
});

export const marcarLeida = manejarAsync(async (req, res) => {
  await srv.marcarLeida(req.usuario!.empresaId, req.usuario!.id, req.params.id);
  responderExito(res, { mensaje: 'Notificación marcada como leída.' });
});

export const marcarTodas = manejarAsync(async (req, res) => {
  await srv.marcarTodasLeidas(req.usuario!.empresaId, req.usuario!.id);
  responderExito(res, { mensaje: 'Todas las notificaciones marcadas como leídas.' });
});
