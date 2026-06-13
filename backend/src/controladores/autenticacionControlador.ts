/**
 * Controlador de autenticación: orquesta peticiones y respuestas, delegando la
 * lógica al servicio de autenticación.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import * as servicio from '../servicios/autenticacionServicio';

export const registrarEmpresa = manejarAsync(async (req, res) => {
  const resultado = await servicio.registrarEmpresa(req.body);
  responderExito(res, {
    estado: 201,
    mensaje: 'Empresa registrada correctamente.',
    datos: resultado,
  });
});

export const login = manejarAsync(async (req, res) => {
  const resultado = await servicio.iniciarSesion(req.body.email, req.body.password, req.ip);
  responderExito(res, { mensaje: 'Sesión iniciada.', datos: resultado });
});

export const refrescar = manejarAsync(async (req, res) => {
  const resultado = await servicio.refrescarToken(req.body.refreshToken);
  responderExito(res, { datos: resultado });
});

export const logout = manejarAsync(async (req, res) => {
  await servicio.cerrarSesion(req.body.refreshToken);
  responderExito(res, { mensaje: 'Sesión cerrada.' });
});

export const perfil = manejarAsync(async (req, res) => {
  const resultado = await servicio.obtenerPerfil(req.usuario!.id);
  responderExito(res, { datos: resultado });
});

export const cambiarContrasena = manejarAsync(async (req, res) => {
  await servicio.cambiarContrasena(req.usuario!.id, req.body.actual, req.body.nueva);
  responderExito(res, { mensaje: 'Contraseña actualizada correctamente.' });
});
