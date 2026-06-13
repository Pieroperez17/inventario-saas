/**
 * Rutas de productos: /api/v1/productos
 * Lectura: cualquier autenticado. Crear/editar: Administrador o Editor.
 * Eliminar: solo Administrador.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/productoControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import { esquemaCrearProducto, esquemaActualizarProducto } from '../validadores/productoValidador';
import { ROLES } from '../config/constantes';

export const enrutadorProductos = Router();
enrutadorProductos.use(verificarAutenticacion);

enrutadorProductos.get('/', ctrl.listar);
enrutadorProductos.get('/:id', ctrl.obtener);
enrutadorProductos.post('/', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaCrearProducto), ctrl.crear);
enrutadorProductos.put('/:id', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaActualizarProducto), ctrl.actualizar);
enrutadorProductos.delete('/:id', verificarRol(ROLES.ADMINISTRADOR), ctrl.eliminar);
