/**
 * Rutas de autenticación: /api/v1/auth/...
 */
import { Router } from 'express';
import * as ctrl from '../controladores/autenticacionControlador';
import { validarCuerpo } from '../utilidades/validacion';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import {
  esquemaRegistroEmpresa,
  esquemaLogin,
  esquemaRefresh,
  esquemaCambioContrasena,
} from '../validadores/autenticacionValidador';

export const enrutadorAutenticacion = Router();

enrutadorAutenticacion.post('/registro', validarCuerpo(esquemaRegistroEmpresa), ctrl.registrarEmpresa);
enrutadorAutenticacion.post('/login', validarCuerpo(esquemaLogin), ctrl.login);
enrutadorAutenticacion.post('/refrescar', validarCuerpo(esquemaRefresh), ctrl.refrescar);
enrutadorAutenticacion.post('/logout', validarCuerpo(esquemaRefresh), ctrl.logout);
enrutadorAutenticacion.get('/yo', verificarAutenticacion, ctrl.perfil);
enrutadorAutenticacion.post(
  '/cambiar-contrasena',
  verificarAutenticacion,
  validarCuerpo(esquemaCambioContrasena),
  ctrl.cambiarContrasena,
);
