/**
 * Rutas de reportes: /api/v1/reportes (lectura para cualquier autenticado).
 */
import { Router } from 'express';
import * as ctrl from '../controladores/reporteControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';

export const enrutadorReportes = Router();
enrutadorReportes.use(verificarAutenticacion);

enrutadorReportes.get('/valorizado', ctrl.valorizado);
enrutadorReportes.get('/movimientos', ctrl.movimientosPorRango);
enrutadorReportes.get('/kardex/:productoId', ctrl.kardex);
