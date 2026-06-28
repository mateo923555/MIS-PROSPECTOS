import { ESTADOS } from '@/lib/constants';
import type { EstadoProspecto } from '@/types';

/** Insignia de color según el estado del prospecto. */
export function EstadoBadge({ estado }: { estado: EstadoProspecto }) {
  const { label, color } = ESTADOS[estado];
  return <span className={`badge badge--${color}`}>{label}</span>;
}
