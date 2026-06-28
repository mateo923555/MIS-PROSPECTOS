import { useMemo, useState } from 'react';
import { useProspectosStore, useUIStore } from '@/store';
import { ORDEN_ESTADOS, ESTADOS, COLOR_HEX } from '@/lib/constants';
import { formatMoneda } from '@/lib/format';
import type { EstadoProspecto } from '@/types';

/**
 * Kanban del embudo: una columna por estado. Arrastrar una tarjeta a otra
 * columna cambia el estado del prospecto (drag & drop nativo HTML5).
 */
export function PipelineKanban() {
  const prospectos = useProspectosStore((s) => s.prospectos);
  const cambiarEstado = useProspectosStore((s) => s.cambiarEstado);
  const notificar = useUIStore((s) => s.notificar);

  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [colDrop, setColDrop] = useState<EstadoProspecto | null>(null);

  // Agrupa prospectos por estado una sola vez por render.
  const porEstado = useMemo(() => {
    const m = new Map<EstadoProspecto, typeof prospectos>();
    for (const e of ORDEN_ESTADOS) m.set(e, []);
    for (const p of prospectos) m.get(p.estado)!.push(p);
    return m;
  }, [prospectos]);

  const soltar = (estado: EstadoProspecto) => {
    if (arrastrando) {
      const p = prospectos.find((x) => x.id === arrastrando);
      if (p && p.estado !== estado) {
        cambiarEstado(arrastrando, estado);
        notificar(`${p.nombre} → ${ESTADOS[estado].label}`, 'info');
      }
    }
    setArrastrando(null);
    setColDrop(null);
  };

  return (
    <div className="kanban">
      {ORDEN_ESTADOS.map((estado) => {
        const items = porEstado.get(estado)!;
        const hex = COLOR_HEX[ESTADOS[estado].color];
        return (
          <div
            key={estado}
            className={`kanban__col ${colDrop === estado ? 'kanban__col--drop' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (colDrop !== estado) setColDrop(estado);
            }}
            onDragLeave={(e) => {
              // Sólo limpiar si salimos de la columna (no de un hijo).
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setColDrop(null);
            }}
            onDrop={() => soltar(estado)}
          >
            <div className="kanban__col-head">
              <span className="kanban__punto" style={{ background: hex }} />
              <span className="kanban__titulo">{ESTADOS[estado].label}</span>
              <span className="kanban__count">{items.length}</span>
            </div>

            <div className="kanban__lista">
              {items.map((p) => (
                <div
                  key={p.id}
                  className={`kanban__card ${arrastrando === p.id ? 'kanban__card--drag' : ''}`}
                  style={{ borderLeftColor: hex }}
                  draggable
                  onDragStart={() => setArrastrando(p.id)}
                  onDragEnd={() => { setArrastrando(null); setColDrop(null); }}
                >
                  <div className="kanban__card-nombre">{p.nombre}</div>
                  {p.empresa && <div className="kanban__card-empresa">{p.empresa}</div>}
                  <div className="kanban__card-valor" style={{ color: hex }}>
                    {formatMoneda(p.valorEstimado)}
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="kanban__vacio">—</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
