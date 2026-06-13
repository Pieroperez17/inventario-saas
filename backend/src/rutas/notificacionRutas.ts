/**
 * Rutas de notificaciones: /api/v1/notificaciones (del usuario autenticado).
 */
import { Router } from 'express';
import * as ctrl from '../controladores/notificacionControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';

export const enrutadorNotificaciones = Router();
enrutadorNotificaciones.use(verificarAutenticacion);

enrutadorNotificaciones.get('/', ctrl.listar);
enrutadorNotificaciones.get('/no-leidas', ctrl.contarNoLeidas);
enrutadorNotificaciones.post('/leer-todas', ctrl.marcarTodas);
enrutadorNotificaciones.patch('/:id/leer', ctrl.marcarLeida);
