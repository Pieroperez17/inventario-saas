/**
 * Logger sencillo y centralizado con marca de tiempo en zona local.
 * Para producción puede sustituirse por pino/winston sin tocar las llamadas.
 */
import { formatearFechaHora } from './fechas';

type Nivel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function escribir(nivel: Nivel, mensaje: string, ...extra: unknown[]): void {
  const marca = formatearFechaHora(new Date());
  const linea = `[${marca}] [${nivel}] ${mensaje}`;
  // eslint-disable-next-line no-console
  if (nivel === 'ERROR') console.error(linea, ...extra);
  // eslint-disable-next-line no-console
  else if (nivel === 'WARN') console.warn(linea, ...extra);
  // eslint-disable-next-line no-console
  else console.log(linea, ...extra);
}

export const logger = {
  info: (mensaje: string, ...extra: unknown[]) => escribir('INFO', mensaje, ...extra),
  warn: (mensaje: string, ...extra: unknown[]) => escribir('WARN', mensaje, ...extra),
  error: (mensaje: string, ...extra: unknown[]) => escribir('ERROR', mensaje, ...extra),
  debug: (mensaje: string, ...extra: unknown[]) => escribir('DEBUG', mensaje, ...extra),
};
