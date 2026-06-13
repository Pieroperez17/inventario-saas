/**
 * Rutas de inventario: /api/v1/inventario (solo lectura; el stock cambia
 * mediante movimientos). Cualquier usuario autenticado puede consultar.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/inventarioControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';

export const enrutadorInventario = Router();
enrutadorInventario.use(verificarAutenticacion);

enrutadorInventario.get('/', ctrl.listar);
enrutadorInventario.get('/consolidado', ctrl.consolidado);
enrutadorInventario.get('/alertas', ctrl.alertas);
