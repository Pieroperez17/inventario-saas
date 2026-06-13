/**
 * Rutas de categorías: /api/v1/categorias
 * Lectura: cualquier autenticado. Crear/editar: Administrador o Editor.
 * Eliminar: solo Administrador.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/categoriaControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaCrearCategoria, esquemaActualizarCategoria } from '../validadores/categoriaValidador';
import { ROLES } from '../config/constantes';

export const enrutadorCategorias = Router();
enrutadorCategorias.use(verificarAutenticacion);

enrutadorCategorias.get('/', ctrl.listar);
enrutadorCategorias.get('/:id', ctrl.obtener);
enrutadorCategorias.post('/', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaCrearCategoria), ctrl.crear);
enrutadorCategorias.put('/:id', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaActualizarCategoria), ctrl.actualizar);
enrutadorCategorias.delete('/:id', verificarRol(ROLES.ADMINISTRADOR), ctrl.eliminar);
