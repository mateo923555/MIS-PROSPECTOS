import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { useAgendaStore, useProspectosStore } from '@/store';
import { formatFechaHora } from '@/lib/format';
import { TIPOS_EVENTO } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';

/** Clasifica un evento por cercanía para colorear el borde y el tag. */
type Cercania = 'hoy' | 'manana' | 'futura';
const clasificar = (iso: string): Cercania => {
  const d = new Date(iso);
  const hoy = new Date();
  const esMismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (esMismoDia(d, hoy)) return 'hoy';
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  if (esMismoDia(d, manana)) return 'manana';
  return 'futura';
};
const TAG: Record<Cercania, string> = { hoy: 'Hoy', manana: 'Mañana', futura: 'Próx.' };

/** Próximos eventos pendientes (no completados, de hoy en adelante). */
export function ProximasCitas() {
  const eventos = useAgendaStore((s) => s.eventos);
  const prospectos = useProspectosStore((s) => s.prospectos);

  const proximas = useMemo(() => {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    return eventos
      .filter((e) => !e.completado && new Date(e.fecha) >= inicioHoy)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 5);
  }, [eventos]);

  const nombrePorId = useMemo(
    () => new Map(prospectos.map((p) => [p.id, p.nombre])),
    [prospectos]
  );

  if (proximas.length === 0) {
    return <EmptyState icono={<CalendarClock size={32} />} titulo="Sin citas próximas" />;
  }

  return (
    <ul className="lista-citas">
      {proximas.map((e) => {
        const c = clasificar(e.fecha);
        return (
          <li key={e.id} className={`cita cita--${c}`}>
            <div className="cita__info">
              <span className="cita__titulo">{e.titulo}</span>
              <span className="cita__prospecto">
                {e.prospectoId ? nombrePorId.get(e.prospectoId) ?? '—' : TIPOS_EVENTO[e.tipo]}
              </span>
            </div>
            <div className="cita__meta">
              <span className={`cita__tag cita__tag--${c}`}>{TAG[c]}</span>
              <span className="cita__fecha">{formatFechaHora(e.fecha)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
