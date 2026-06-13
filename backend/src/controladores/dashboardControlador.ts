/**
 * Controlador del dashboard.
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import { resumenDashboard } from '../servicios/dashboardServicio';

export const resumen = manejarAsync(async (req, res) => {
  responderExito(res, { datos: await resumenDashboard(req.usuario!.empresaId) });
});
