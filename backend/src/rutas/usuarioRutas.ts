/**
 * Rutas de usuarios: /api/v1/usuarios (solo Administrador).
 */
import { Router } from 'express';
import * as ctrl from '../controladores/usuarioControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import {
  esquemaCrearUsuario,
  esquemaActualizarUsuario,
  esquemaEstadoUsuario,
  esquemaRestablecerContrasena,
} from '../validadores/usuarioValidador';
import { ROLES } from '../config/constantes';

export const enrutadorUsuarios = Router();

enrutadorUsuarios.use(verificarAutenticacion, verificarRol(ROLES.ADMINISTRADOR));

enrutadorUsuarios.get('/', ctrl.listar);
enrutadorUsuarios.post('/', validarCuerpo(esquemaCrearUsuario), ctrl.crear);
enrutadorUsuarios.get('/:id', ctrl.obtener);
enrutadorUsuarios.put('/:id', validarCuerpo(esquemaActualizarUsuario), ctrl.actualizar);
enrutadorUsuarios.patch('/:id/estado', validarCuerpo(esquemaEstadoUsuario), ctrl.cambiarEstado);
enrutadorUsuarios.post(
  '/:id/restablecer-contrasena',
  validarCuerpo(esquemaRestablecerContrasena),
  ctrl.restablecerContrasena,
);
