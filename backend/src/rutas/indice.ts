/**
 * Enrutador principal de la API (versión v1). Aquí se montan los enrutadores
 * de cada recurso. En la Fase 1 solo se exponen los chequeos de salud; las
 * fases siguientes irán añadiendo: auth, empresa, usuarios, almacenes, etc.
 */
import { Router } from 'express';
import { prisma } from '../config/baseDatos';
import { responderExito, responderError } from '../vistas/respuesta';
import { manejarAsync } from '../utilidades/asincrono';
import { APP } from '../config/constantes';
import { enrutadorAutenticacion } from './autenticacionRutas';
import { enrutadorEmpresa } from './empresaRutas';
import { enrutadorUsuarios } from './usuarioRutas';
import { enrutadorAlmacenes } from './almacenRutas';
import { enrutadorTiendas } from './tiendaRutas';
import { enrutadorCategorias } from './categoriaRutas';
import { enrutadorProductos } from './productoRutas';
import { enrutadorInventario } from './inventarioRutas';
import { enrutadorMovimientos } from './movimientoRutas';
import { enrutadorProveedores } from './proveedorRutas';
import { enrutadorReportes } from './reporteRutas';
import { enrutadorExportacion } from './exportacionRutas';
import { enrutadorNotificaciones } from './notificacionRutas';
import { enrutadorMensajes } from './mensajeRutas';
import { enrutadorAuditoria } from './auditoriaRutas';
import { enrutadorDashboard } from './dashboardRutas';

export const enrutadorPrincipal = Router();

/** Liveness: indica que el servicio está arriba (no consulta la BD). */
enrutadorPrincipal.get('/salud', (_req, res) => {
  responderExito(res, {
    mensaje: 'API operativa',
    datos: {
      aplicacion: APP.nombre,
      version: '1.0.0',
      marca: new Date().toISOString(),
    },
  });
});

/** Readiness: verifica que la base de datos responde. */
enrutadorPrincipal.get(
  '/salud/bd',
  manejarAsync(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      responderExito(res, { mensaje: 'Base de datos operativa', datos: { baseDatos: 'ok' } });
    } catch {
      responderError(res, 503, 'La base de datos no responde.', 'BD_NO_DISPONIBLE');
    }
  }),
);

// === Montaje de recursos ===
enrutadorPrincipal.use('/auth', enrutadorAutenticacion);
enrutadorPrincipal.use('/empresa', enrutadorEmpresa);
enrutadorPrincipal.use('/usuarios', enrutadorUsuarios);
enrutadorPrincipal.use('/almacenes', enrutadorAlmacenes);
enrutadorPrincipal.use('/tiendas', enrutadorTiendas);
enrutadorPrincipal.use('/categorias', enrutadorCategorias);
enrutadorPrincipal.use('/productos', enrutadorProductos);
enrutadorPrincipal.use('/inventario', enrutadorInventario);
enrutadorPrincipal.use('/movimientos', enrutadorMovimientos);
enrutadorPrincipal.use('/proveedores', enrutadorProveedores);
enrutadorPrincipal.use('/reportes', enrutadorReportes);
enrutadorPrincipal.use('/exportar', enrutadorExportacion);
enrutadorPrincipal.use('/notificaciones', enrutadorNotificaciones);
enrutadorPrincipal.use('/mensajes', enrutadorMensajes);
enrutadorPrincipal.use('/auditoria', enrutadorAuditoria);
enrutadorPrincipal.use('/dashboard', enrutadorDashboard);
