/** Helpers de formato para moneda, números y fechas (es-PE). */
import dayjs from 'dayjs';

export function formatearMoneda(valor: number | undefined | null, moneda = 'PEN'): string {
  const simbolo = moneda === 'PEN' ? 'S/' : moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : '';
  const numero = Number(valor ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${simbolo} ${numero}`;
}

export function formatearNumero(valor: number | undefined | null): string {
  return Number(valor ?? 0).toLocaleString('es-PE');
}

export function formatearFecha(fecha: string | Date): string {
  return dayjs(fecha).format('DD/MM/YYYY');
}

export function formatearFechaHora(fecha: string | Date): string {
  return dayjs(fecha).format('DD/MM/YYYY HH:mm');
}
