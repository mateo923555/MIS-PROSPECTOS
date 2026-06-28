import { useMemo } from 'react';
import { useProspectosStore, useLlamadasStore, useAgendaStore } from '@/store';
import { ORDEN_ESTADOS } from '@/lib/constants';
import type { MetricasDashboard, EstadoProspecto } from '@/types';

const esHoy = (iso: string): boolean => {
  const d = new Date(iso);
  const hoy = new Date();
  return (
    d.getFullYear() === hoy.getFullYear() &&
    d.getMonth() === hoy.getMonth() &&
    d.getDate() === hoy.getDate()
  );
};

/**
 * Métricas derivadas del dashboard. Memorizadas: sólo recalculan cuando
 * cambian prospectos, llamadas o eventos.
 */
export function useMetricas(): MetricasDashboard {
  const prospectos = useProspectosStore((s) => s.prospectos);
  const llamadas = useLlamadasStore((s) => s.llamadas);
  const eventos = useAgendaStore((s) => s.eventos);

  return useMemo(() => {
    const porEstado = ORDEN_ESTADOS.reduce(
      (acc, e) => ({ ...acc, [e]: 0 }),
      {} as Record<EstadoProspecto, number>
    );
    for (const p of prospectos) porEstado[p.estado]++;

    const ganados = porEstado.ganado;
    const perdidos = porEstado.perdido;
    const cerrados = ganados + perdidos;
    const cerradoEstados: EstadoProspecto[] = ['ganado', 'perdido'];

    return {
      totalProspectos: prospectos.length,
      prospectosActivos: prospectos.filter(
        (p) => !cerradoEstados.includes(p.estado)
      ).length,
      ganados,
      perdidos,
      valorEnEmbudo: prospectos
        .filter((p) => !cerradoEstados.includes(p.estado))
        .reduce((sum, p) => sum + (p.valorEstimado || 0), 0),
      tasaConversion: cerrados === 0 ? 0 : Math.round((ganados / cerrados) * 100),
      porEstado,
      llamadasHoy: llamadas.filter((l) => esHoy(l.fecha)).length,
      eventosPendientes: eventos.filter((e) => !e.completado).length,
    };
  }, [prospectos, llamadas, eventos]);
}
