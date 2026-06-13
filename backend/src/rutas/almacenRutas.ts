/**
 * Rutas de almacenes: /api/v1/almacenes
 * Lectura: cualquier usuario autenticado. Gestión: solo Administrador.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/almacenControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaCrearUbicacion, esquemaActualizarUbicacion } from '../validadores/ubicacionValidador';
import { ROLES } from '../config/constantes';

export const enrutadorAlmacenes = Router();
enrutadorAlmacenes.use(verificarAutenticacion);

enrutadorAlmacenes.get('/', ctrl.listar);
enrutadorAlmacenes.get('/:id', ctrl.obtener);
enrutadorAlmacenes.post('/', verificarRol(ROLES.ADMINISTRADOR), validarCuerpo(esquemaCrearUbicacion), ctrl.crear);
enrutadorAlmacenes.put('/:id', verificarRol(ROLES.ADMINISTRADOR), validarCuerpo(esquemaActualizarUbicacion), ctrl.actualizar);
enrutadorAlmacenes.delete('/:id', verificarRol(ROLES.ADMINISTRADOR), ctrl.eliminar);
