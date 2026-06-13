/**
 * Utilidades de fecha/hora ancladas a la zona horaria de la empresa
 * (por defecto America/Lima, UTC-5). Se usa dayjs con los plugins utc y
 * timezone para formatear de forma consistente en toda la aplicación.
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { entorno } from '../config/entorno';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

/** Zona horaria por defecto del sistema. */
export const ZONA_HORARIA = entorno.ZONA_HORARIA;

/** Fecha/hora actual (en UTC, como la almacena PostgreSQL). */
export function ahora(): Date {
  return new Date();
}

/** Convierte una fecha a la zona horaria de la empresa. */
export function aZonaLocal(fecha: Date | string, zona: string = ZONA_HORARIA) {
  return dayjs(fecha).tz(zona);
}

/** Formatea una fecha/hora. Formato por defecto: DD/MM/YYYY HH:mm. */
export function formatearFechaHora(
  fecha: Date | string,
  zona: string = ZONA_HORARIA,
): string {
  return dayjs(fecha).tz(zona).format('DD/MM/YYYY HH:mm');
}

/** Formatea solo la fecha: DD/MM/YYYY. */
export function formatearFecha(fecha: Date | string, zona: string = ZONA_HORARIA): string {
  return dayjs(fecha).tz(zona).format('DD/MM/YYYY');
}

/** Formato técnico para logs y nombres de archivo: YYYY-MM-DD_HH-mm-ss. */
export function marcaDeTiempo(zona: string = ZONA_HORARIA): string {
  return dayjs().tz(zona).format('YYYY-MM-DD_HH-mm-ss');
}

/**
 * Convierte un valor de query string a Date. Si es solo fecha (YYYY-MM-DD) y
 * `finDeDia` es true, la lleva al final del día para incluirlo en los rangos.
 */
export function parseFechaConsulta(valor: unknown, finDeDia = false): Date | undefined {
  if (!valor) return undefined;
  const texto = String(valor);
  const iso = finDeDia && texto.length === 10 ? `${texto}T23:59:59.999` : texto;
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}
