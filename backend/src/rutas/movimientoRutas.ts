/**
 * Rutas de movimientos: /api/v1/movimientos
 * Lectura: cualquier autenticado. Registrar: Administrador o Editor.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/movimientoControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaMovimiento } from '../validadores/movimientoValidador';
import { ROLES } from '../config/constantes';

export const enrutadorMovimientos = Router();
enrutadorMovimientos.use(verificarAutenticacion);

enrutadorMovimientos.get('/', ctrl.listar);
enrutadorMovimientos.post(
  '/',
  verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR),
  validarCuerpo(esquemaMovimiento),
  ctrl.registrar,
);
