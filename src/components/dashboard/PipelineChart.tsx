import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { useProspectosStore } from '@/store';
import { ORDEN_ESTADOS, ESTADOS, COLOR_HEX } from '@/lib/constants';
import { formatMoneda } from '@/lib/format';

/** Barras horizontales: valor estimado acumulado por etapa del embudo. */
export function PipelineChart() {
  const prospectos = useProspectosStore((s) => s.prospectos);

  const data = useMemo(
    () =>
      ORDEN_ESTADOS.map((estado) => {
        const items = prospectos.filter((p) => p.estado === estado);
        return {
          nombre: ESTADOS[estado].label,
          valor: items.reduce((sum, p) => sum + (p.valorEstimado || 0), 0),
          count: items.length,
          color: COLOR_HEX[ESTADOS[estado].color],
        };
      }),
    [prospectos]
  );

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="nombre"
            width={88}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            formatter={(value, _name, item) => {
              const count = (item?.payload as { count?: number })?.count ?? 0;
              return [`${formatMoneda(Number(value))} · ${count} prosp.`, 'Valor'];
            }}
          />
          <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
