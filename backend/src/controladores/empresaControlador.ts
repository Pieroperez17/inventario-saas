/**
 * Controlador de la empresa (tenant).
 */
import { manejarAsync } from '../utilidades/asincrono';
import { responderExito } from '../vistas/respuesta';
import * as servicio from '../servicios/empresaServicio';

export const obtener = manejarAsync(async (req, res) => {
  const empresa = await servicio.obtenerEmpresa(req.usuario!.empresaId);
  responderExito(res, { datos: empresa });
});

export const actualizar = manejarAsync(async (req, res) => {
  const empresa = await servicio.actualizarEmpresa(
    req.usuario!.empresaId,
    req.body,
    req.usuario!.id,
  );
  responderExito(res, { mensaje: 'Datos de la empresa actualizados.', datos: empresa });
});
