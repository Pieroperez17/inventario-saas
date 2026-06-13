/**
 * Rutas de proveedores: /api/v1/proveedores
 * Lectura: cualquier autenticado. Crear/editar/asociar: Administrador o Editor.
 * Eliminar: solo Administrador.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/proveedorControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { validarCuerpo } from '../utilidades/validacion';
import {
  esquemaCrearProveedor,
  esquemaActualizarProveedor,
  esquemaAsociarProductos,
} from '../validadores/proveedorValidador';
import { ROLES } from '../config/constantes';

export const enrutadorProveedores = Router();
enrutadorProveedores.use(verificarAutenticacion);

enrutadorProveedores.get('/', ctrl.listar);
enrutadorProveedores.get('/:id', ctrl.obtener);
enrutadorProveedores.post('/', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaCrearProveedor), ctrl.crear);
enrutadorProveedores.put('/:id', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaActualizarProveedor), ctrl.actualizar);
enrutadorProveedores.post('/:id/productos', verificarRol(ROLES.ADMINISTRADOR, ROLES.EDITOR), validarCuerpo(esquemaAsociarProductos), ctrl.asociarProductos);
enrutadorProveedores.delete('/:id', verificarRol(ROLES.ADMINISTRADOR), ctrl.eliminar);
