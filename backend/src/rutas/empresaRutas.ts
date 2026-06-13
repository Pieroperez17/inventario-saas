/**
 * Rutas de la empresa: /api/v1/empresa
 */
import { Router } from 'express';
import * as ctrl from '../controladores/empresaControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaActualizarEmpresa } from '../validadores/empresaValidador';
import { ROLES } from '../config/constantes';

export const enrutadorEmpresa = Router();

enrutadorEmpresa.use(verificarAutenticacion);

enrutadorEmpresa.get('/', ctrl.obtener);
enrutadorEmpresa.put(
  '/',
  verificarRol(ROLES.ADMINISTRADOR),
  validarCuerpo(esquemaActualizarEmpresa),
  ctrl.actualizar,
);
