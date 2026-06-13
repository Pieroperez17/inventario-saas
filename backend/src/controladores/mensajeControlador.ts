/**
 * Controlador de mensajería interna.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import * as srv from '../servicios/mensajeServicio';

export const bandeja = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total, noLeidos } = await srv.bandejaEntrada(req.usuario!.empresaId, req.usuario!.id, params);
  responderExito(res, { datos, meta: { ...construirMeta(total, params.pagina, params.limite), noLeidos } });
});

export const enviados = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await srv.enviados(req.usuario!.empresaId, req.usuario!.id, params);
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});

export const noLeidos = manejarAsync(async (req, res) => {
  const noLeidos = await srv.contarNoLeidos(req.usuario!.empresaId, req.usuario!.id);
  responderExito(res, { datos: { noLeidos } });
});

export const contactos = manejarAsync(async (req, res) => {
  const datos = await srv.listarContactos(req.usuario!.empresaId, req.usuario!.id);
  responderExito(res, { datos });
});

export const obtener = manejarAsync(async (req, res) => {
  const datos = await srv.obtenerMensaje(req.usuario!.empresaId, req.usuario!.id, req.params.id);
  responderExito(res, { datos });
});

export const enviar = manejarAsync(async (req, res) => {
  const mensaje = await srv.enviarMensaje(req.usuario!.empresaId, req.usuario!.id, req.body);
  responderExito(res, { estado: 201, mensaje: 'Mensaje enviado.', datos: mensaje });
});

export const marcarLeido = manejarAsync(async (req, res) => {
  await srv.marcarLeido(req.usuario!.empresaId, req.usuario!.id, req.params.id);
  responderExito(res, { mensaje: 'Mensaje marcado como leído.' });
});
