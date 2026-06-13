/**
 * Rutas de tiendas: /api/v1/tiendas
 * Lectura: cualquier usuario autenticado. Gestión: solo Administrador.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/tiendaControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaCrearUbicacion, esquemaActualizarUbicacion } from '../validadores/ubicacionValidador';
import { ROLES } from '../config/constantes';

export const enrutadorTiendas = Router();
enrutadorTiendas.use(verificarAutenticacion);

enrutadorTiendas.get('/', ctrl.listar);
enrutadorTiendas.get('/:id', ctrl.obtener);
enrutadorTiendas.post('/', verificarRol(ROLES.ADMINISTRADOR), validarCuerpo(esquemaCrearUbicacion), ctrl.crear);
enrutadorTiendas.put('/:id', verificarRol(ROLES.ADMINISTRADOR), validarCuerpo(esquemaActualizarUbicacion), ctrl.actualizar);
enrutadorTiendas.delete('/:id', verificarRol(ROLES.ADMINISTRADOR), ctrl.eliminar);
