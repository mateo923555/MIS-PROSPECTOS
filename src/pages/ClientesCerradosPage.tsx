import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';
import {
  Trophy, TrendingUp, DollarSign, Clock, Calendar, Briefcase, Award,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useProspectosStore, useLlamadasStore } from '@/store';
import { SERVICIOS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  '$' + Math.round(n).toLocaleString('es-AR');

const fmtFecha = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const diffDias = (desde: string, hasta: string) => {
  const ms = new Date(hasta).getTime() - new Date(desde).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
};

function ultimos6Meses(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d
      .toLocaleString('es-AR', { month: 'short' })
      .replace('.', '');
    out.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Custom Tooltip para Recharts
// ---------------------------------------------------------------------------
const TooltipIngresos = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__val" style={{ color: 'var(--green)' }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  );
};

const TooltipTasa = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__val" style={{ color: 'var(--cyan)' }}>
        {payload[0].value}%
      </p>
    </div>
  );
};

const TooltipDias = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__val" style={{ color: 'var(--purple)' }}>
        {payload[0].value} días
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ClientesCerradosPage() {
  const prospectos = useProspectosStore((s) => s.prospectos);
  const llamadas   = useLlamadasStore((s) => s.llamadas);

  // ── Listas derivadas ──────────────────────────────────────────────────────
  const ganados = useMemo(
    () => prospectos.filter((p) => p.estado === 'ganado'),
    [prospectos],
  );
  const perdidos = useMemo(
    () => prospectos.filter((p) => p.estado === 'perdido'),
    [prospectos],
  );

  // ── Métricas ──────────────────────────────────────────────────────────────
  const valorTotal = useMemo(
    () => ganados.reduce((s, p) => s + p.valorEstimado, 0),
    [ganados],
  );

  const mesKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const ingresosEsteMes = useMemo(
    () =>
      ganados
        .filter((p) => p.fechaCierre?.startsWith(mesKey))
        .reduce((s, p) => s + p.valorEstimado, 0),
    [ganados, mesKey],
  );

  const tasaConversion = useMemo(() => {
    const total = ganados.length + perdidos.length;
    return total > 0 ? Math.round((ganados.length / total) * 100) : 0;
  }, [ganados, perdidos]);

  const diasPromedio = useMemo(() => {
    const con_fecha = ganados.filter((p) => p.fechaCierre);
    if (con_fecha.length === 0) return 0;
    const total = con_fecha.reduce(
      (s, p) => s + diffDias(p.createdAt, p.fechaCierre!),
      0,
    );
    return Math.round(total / con_fecha.length);
  }, [ganados]);

  // ── Timeline ─────────────────────────────────────────────────────────────
  const timeline = useMemo(
    () =>
      [...ganados]
        .filter((p) => p.fechaCierre)
        .sort(
          (a, b) =>
            new Date(b.fechaCierre!).getTime() -
            new Date(a.fechaCierre!).getTime(),
        )
        .slice(0, 10),
    [ganados],
  );

  // ── Datos de gráficos ────────────────────────────────────────────────────
  const meses = useMemo(() => ultimos6Meses(), []);

  const ingresosChart = useMemo(
    () =>
      meses.map(({ key, label }) => ({
        mes: label,
        ingresos: ganados
          .filter((p) => p.fechaCierre?.startsWith(key))
          .reduce((s, p) => s + p.valorEstimado, 0),
      })),
    [meses, ganados],
  );

  const conversionChart = useMemo(
    () =>
      meses.map(({ key, label }) => {
        const g  = ganados.filter((p) => p.fechaCierre?.startsWith(key)).length;
        const pe = perdidos.filter((p) => p.fechaCierre?.startsWith(key)).length;
        const tot = g + pe;
        return { mes: label, tasa: tot > 0 ? Math.round((g / tot) * 100) : 0 };
      }),
    [meses, ganados, perdidos],
  );

  const diasChart = useMemo(
    () =>
      meses.map(({ key, label }) => {
        const sub = ganados.filter(
          (p) => p.fechaCierre?.startsWith(key) && p.fechaCierre,
        );
        if (sub.length === 0) return { mes: label, dias: 0 };
        const avg =
          sub.reduce((s, p) => s + diffDias(p.createdAt, p.fechaCierre!), 0) /
          sub.length;
        return { mes: label, dias: Math.round(avg) };
      }),
    [meses, ganados],
  );

  // ── Detalles por cliente ─────────────────────────────────────────────────
  const tabla = useMemo(
    () =>
      [...ganados]
        .sort((a, b) => {
          if (!a.fechaCierre) return 1;
          if (!b.fechaCierre) return -1;
          return new Date(b.fechaCierre).getTime() - new Date(a.fechaCierre).getTime();
        })
        .map((p) => ({
          ...p,
          llamadasCount: llamadas.filter((l) => l.prospectoId === p.id).length,
          diasACierre: p.fechaCierre ? diffDias(p.createdAt, p.fechaCierre) : null,
        })),
    [ganados, llamadas],
  );

  // ── Colores de barras por índice ─────────────────────────────────────────
  const COLORS_INGRESOS = ['#00ff88', '#00e67a', '#00cc6a', '#00b35b', '#009a4e', '#008040'];
  const COLORS_DIAS     = ['#a855f7', '#9b4de0', '#8f44c8', '#833bb0', '#763299', '#6a2a82'];

  return (
    <div className="clientes-page">

      {/* ═══ Métricas ════════════════════════════════════════════════════════ */}
      <div className="clientes-metricas">
        <div className="clientes-metrica clientes-metrica--verde">
          <div className="clientes-metrica__icono">
            <Trophy size={22} />
          </div>
          <div className="clientes-metrica__info">
            <span className="clientes-metrica__valor">{ganados.length}</span>
            <span className="clientes-metrica__label">Clientes cerrados</span>
          </div>
        </div>

        <div className="clientes-metrica clientes-metrica--cyan">
          <div className="clientes-metrica__icono">
            <DollarSign size={22} />
          </div>
          <div className="clientes-metrica__info">
            <span className="clientes-metrica__valor">{fmt(valorTotal)}</span>
            <span className="clientes-metrica__label">Valor total cobrado</span>
          </div>
        </div>

        <div className="clientes-metrica clientes-metrica--amber">
          <div className="clientes-metrica__icono">
            <TrendingUp size={22} />
          </div>
          <div className="clientes-metrica__info">
            <span className="clientes-metrica__valor">{fmt(ingresosEsteMes)}</span>
            <span className="clientes-metrica__label">Ingresos este mes</span>
          </div>
        </div>

        <div className="clientes-metrica clientes-metrica--magenta">
          <div className="clientes-metrica__icono">
            <Award size={22} />
          </div>
          <div className="clientes-metrica__info">
            <span className="clientes-metrica__valor">{tasaConversion}%</span>
            <span className="clientes-metrica__label">Tasa de conversión</span>
          </div>
        </div>

        <div className="clientes-metrica clientes-metrica--purple">
          <div className="clientes-metrica__icono">
            <Clock size={22} />
          </div>
          <div className="clientes-metrica__info">
            <span className="clientes-metrica__valor">{diasPromedio}d</span>
            <span className="clientes-metrica__label">Días prom. a cierre</span>
          </div>
        </div>
      </div>

      {/* ═══ Timeline + Tabla ════════════════════════════════════════════════ */}
      <div className="clientes-contenido">

        {/* Timeline */}
        <Card titulo="Timeline de cierres" className="clientes-timeline-card">
          {timeline.length === 0 ? (
            <p className="clientes-vacio">Aún no hay clientes cerrados.</p>
          ) : (
            <ol className="clientes-timeline">
              {timeline.map((p, idx) => (
                <li key={p.id} className="clientes-timeline__item">
                  <div className={`clientes-timeline__dot ${idx === 0 ? 'clientes-timeline__dot--primero' : ''}`} />
                  {idx < timeline.length - 1 && (
                    <div className="clientes-timeline__linea" />
                  )}
                  <div className="clientes-timeline__info">
                    <p className="clientes-timeline__nombre">{p.nombre}</p>
                    <p className="clientes-timeline__meta">
                      <Calendar size={11} />
                      {fmtFecha(p.fechaCierre)}
                      {p.servicio && (
                        <>
                          <Briefcase size={11} />
                          {SERVICIOS[p.servicio]}
                        </>
                      )}
                    </p>
                    <p className="clientes-timeline__monto">{fmt(p.valorEstimado)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* Tabla de detalles */}
        <Card titulo="Detalle por cliente" className="clientes-tabla-card">
          {tabla.length === 0 ? (
            <p className="clientes-vacio">Sin clientes cerrados aún.</p>
          ) : (
            <div className="clientes-tabla-wrap">
              <table className="clientes-tabla">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Costo</th>
                    <th>Cierre</th>
                    <th>Días</th>
                    <th>Llamadas</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <p className="clientes-tabla__nombre">{p.nombre}</p>
                        {p.empresa && (
                          <p className="clientes-tabla__empresa">{p.empresa}</p>
                        )}
                      </td>
                      <td>
                        {p.servicio ? (
                          <span className="clientes-servicio-badge">
                            {SERVICIOS[p.servicio]}
                          </span>
                        ) : (
                          <span className="clientes-tabla__muted">—</span>
                        )}
                      </td>
                      <td className="clientes-tabla__monto">{fmt(p.valorEstimado)}</td>
                      <td className="clientes-tabla__fecha">{fmtFecha(p.fechaCierre)}</td>
                      <td>
                        {p.diasACierre !== null ? (
                          <span className="clientes-dias-badge">{p.diasACierre}d</span>
                        ) : (
                          <span className="clientes-tabla__muted">—</span>
                        )}
                      </td>
                      <td className="clientes-tabla__calls">{p.llamadasCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ═══ Gráficos ════════════════════════════════════════════════════════ */}
      <div className="clientes-charts">

        {/* Ingresos por mes */}
        <Card titulo="Ingresos por mes (últimos 6)">
          <div className="clientes-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ingresosChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: '#8b96b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8b96b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? '0' : `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip content={<TooltipIngresos />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {ingresosChart.map((_, i) => (
                    <Cell key={i} fill={COLORS_INGRESOS[i] ?? '#00ff88'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tasa conversión por mes */}
        <Card titulo="Tasa de conversión por mes">
          <div className="clientes-chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={conversionChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: '#8b96b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#8b96b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={40}
                />
                <Tooltip content={<TooltipTasa />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line
                  type="monotone"
                  dataKey="tasa"
                  stroke="#00d4ff"
                  strokeWidth={2.5}
                  dot={{ fill: '#00d4ff', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#00d4ff', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Días promedio a cierre */}
        <Card titulo="Días promedio a cierre por mes">
          <div className="clientes-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diasChart} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: '#8b96b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8b96b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}d`}
                  width={36}
                />
                <Tooltip content={<TooltipDias />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="dias" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {diasChart.map((_, i) => (
                    <Cell key={i} fill={COLORS_DIAS[i] ?? '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
}
