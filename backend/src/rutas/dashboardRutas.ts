/**
 * Rutas del dashboard: /api/v1/dashboard (cualquier usuario autenticado).
 */
import { Router } from 'express';
import * as ctrl from '../controladores/dashboardControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';

export const enrutadorDashboard = Router();
enrutadorDashboard.use(verificarAutenticacion);

enrutadorDashboard.get('/', ctrl.resumen);
