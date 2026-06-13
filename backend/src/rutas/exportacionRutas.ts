/**
 * Rutas de exportación a Excel: /api/v1/exportar
 * Cualquier rol puede exportar (incluido Visualizador). La exportación de
 * usuarios queda restringida al Administrador.
 */
import { Router } from 'express';
import * as ctrl from '../controladores/exportacionControlador';
import { verificarAutenticacion } from '../middlewares/autenticacion';
import { verificarRol } from '../middlewares/autorizacion';
import { ROLES } from '../config/constantes';

export const enrutadorExportacion = Router();
enrutadorExportacion.use(verificarAutenticacion);

enrutadorExportacion.get('/productos', ctrl.productos);
enrutadorExportacion.get('/inventario', ctrl.inventario);
enrutadorExportacion.get('/movimientos', ctrl.movimientos);
enrutadorExportacion.get('/valorizado', ctrl.valorizado);
enrutadorExportacion.get('/kardex/:productoId', ctrl.kardex);
enrutadorExportacion.get('/usuarios', verificarRol(ROLES.ADMINISTRADOR), ctrl.usuarios);
