/**
 * Clase de error controlado de la aplicación. Permite lanzar errores con un
 * código HTTP y un código de negocio, capturados por el manejador central.
 */
export class ErrorAplicacion extends Error {
  public readonly estado: number;
  public readonly codigo: string;
  public readonly detalles?: unknown;
  public readonly operacional: boolean;

  constructor(mensaje: string, estado = 400, codigo = 'ERROR', detalles?: unknown) {
    super(mensaje);
    this.name = 'ErrorAplicacion';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
    this.operacional = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static noAutenticado(mensaje = 'No has iniciado sesión.') {
    return new ErrorAplicacion(mensaje, 401, 'NO_AUTENTICADO');
  }

  static prohibido(mensaje = 'No tienes permisos para realizar esta acción.') {
    return new ErrorAplicacion(mensaje, 403, 'PROHIBIDO');
  }

  static noEncontrado(mensaje = 'Recurso no encontrado.') {
    return new ErrorAplicacion(mensaje, 404, 'NO_ENCONTRADO');
  }

  static conflicto(mensaje = 'Conflicto con el estado actual del recurso.') {
    return new ErrorAplicacion(mensaje, 409, 'CONFLICTO');
  }

  static validacion(mensaje = 'Los datos enviados no son válidos.', detalles?: unknown) {
    return new ErrorAplicacion(mensaje, 422, 'VALIDACION', detalles);
  }
}
