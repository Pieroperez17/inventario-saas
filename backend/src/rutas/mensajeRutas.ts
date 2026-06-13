/**
 * Rutas de mensajería interna: /api/v1/mensajes.
 * Las rutas estáticas se declaran antes de la ruta con parámetro `:id`.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/mensajeControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaEnviarMensaje } from '../validadores/mensajeValidador';

export const enrutadorMensajes = Router();
enrutadorMensajes.use(verificarAutenticacion);

enrutadorMensajes.get('/', ctrl.bandeja);
enrutadorMensajes.get('/enviados', ctrl.enviados);
enrutadorMensajes.get('/no-leidos', ctrl.noLeidos);
enrutadorMensajes.get('/contactos', ctrl.contactos);
enrutadorMensajes.post('/', validarCuerpo(esquemaEnviarMensaje), ctrl.enviar);
enrutadorMensajes.get('/:id', ctrl.obtener);
enrutadorMensajes.patch('/:id/leer', ctrl.marcarLeido);
