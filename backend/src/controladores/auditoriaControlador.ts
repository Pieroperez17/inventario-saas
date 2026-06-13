/**
 * Controlador de la bitácora de auditoría (solo Administrador).
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { obtenerParametrosListado, construirMeta } from '../utilidades/paginacion';
import { parseFechaConsulta } from '../utilidades/fechas';
import { listarAuditoria } from '../servicios/auditoriaServicio';

export const listar = manejarAsync(async (req, res) => {
  const params = obtenerParametrosListado(req);
  const { datos, total } = await listarAuditoria(req.usuario!.empresaId, {
    ...params,
    entidad: req.query.entidad ? String(req.query.entidad) : undefined,
    accion: req.query.accion ? String(req.query.accion) : undefined,
    usuarioId: req.query.usuarioId ? String(req.query.usuarioId) : undefined,
    desde: parseFechaConsulta(req.query.desde),
    hasta: parseFechaConsulta(req.query.hasta, true),
  });
  responderExito(res, { datos, meta: construirMeta(total, params.pagina, params.limite) });
});
