/**
 * Rutas de auditoría: /api/v1/auditoria (solo Administrador).
 */
import { Router } from 'express';
import * as ctrl from '../controladores/auditoriaControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { ROLES } from '../config/constantes';

export const enrutadorAuditoria = Router();
enrutadorAuditoria.use(verificarAutenticacion, verificarRol(ROLES.ADMINISTRADOR));

enrutadorAuditoria.get('/', ctrl.listar);
