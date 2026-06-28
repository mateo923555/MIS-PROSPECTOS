import type { ISODate } from '@/types';

/** Formato de moneda local (ajusta locale/currency si lo necesitas). */
const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export const formatMoneda = (n: number): string => moneda.format(n || 0);

/** "31 may 2026" */
export const formatFecha = (iso: ISODate): string =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/** "31 may, 14:30" */
export const formatFechaHora = (iso: ISODate): string =>
  new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Devuelve "hace 3 días" / "en 2 horas" de forma simple. */
export const tiempoRelativo = (iso: ISODate): string => {
  const diff = new Date(iso).getTime() - Date.now();
  const min = Math.round(diff / 60000);
  const abs = Math.abs(min);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (abs < 60) return rtf.format(min, 'minute');
  if (abs < 1440) return rtf.format(Math.round(min / 60), 'hour');
  return rtf.format(Math.round(min / 1440), 'day');
};
