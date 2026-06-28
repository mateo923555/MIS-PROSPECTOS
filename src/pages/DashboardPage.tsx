import { useState } from 'react';
import { Users, Wallet, TrendingUp, Phone, Target, Send } from 'lucide-react';
import { useMetricas } from '@/hooks/useMetricas';
import { useProspectosStore, useUIStore } from '@/store';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { PipelineKanban } from '@/components/dashboard/PipelineKanban';
import { ProximasCitas } from '@/components/dashboard/ProximasCitas';
import { formatMoneda } from '@/lib/format';
import { sembrarTodo } from '@/services/seedService';
import { enviarEmailLibre } from '@/services/gmailService';
import { getEmailGuardado } from '@/services/googleAuthService';

export function DashboardPage() {
  const m              = useMetricas();
  const hayDatos       = useProspectosStore((s) => s.prospectos.length > 0);
  const prospectos     = useProspectosStore((s) => s.prospectos);
  const notificar      = useUIStore((s) => s.notificar);
  const googleConectado = useUIStore((s) => s.googleConectado);

  const [destinatario, setDestinatario] = useState('');
  const [cuerpo, setCuerpo]             = useState('');
  const [enviando, setEnviando]         = useState(false);

  const conEmail = prospectos.filter((p) => !!p.email);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinatario || !cuerpo.trim()) return;
    const p = prospectos.find((x) => x.id === destinatario);
    if (!p?.email) return;

    setEnviando(true);
    try {
      const deEmail = getEmailGuardado();
      await enviarEmailLibre(
        p.email,
        `Seguimiento — ${p.nombre}`,
        cuerpo.trim(),
        deEmail
      );
      notificar(`Email enviado a ${p.email}`, 'exito');
      setCuerpo('');
      setDestinatario('');
    } catch (err) {
      notificar(err instanceof Error ? err.message : 'Error al enviar', 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (!hayDatos) {
    return (
      <EmptyState
        icono={<Target size={32} />}
        titulo="¡Bienvenido a Mi Prospectos!"
        descripcion="Aún no hay datos. Carga un set de ejemplo para ver el dashboard en acción."
        accion={
          <Button
            onClick={() => {
              sembrarTodo();
              notificar('Datos de ejemplo cargados', 'exito');
            }}
          >
            Cargar datos de ejemplo
          </Button>
        }
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        <StatCard Icono={Users}      etiqueta="Prospectos activos" valor={m.prospectosActivos}           color="blue"   />
        <StatCard Icono={Wallet}     etiqueta="Valor en embudo"    valor={formatMoneda(m.valorEnEmbudo)} color="mint"   />
        <StatCard Icono={TrendingUp} etiqueta="Tasa de conversión" valor={`${m.tasaConversion}%`}        color="purple" />
        <StatCard Icono={Phone}      etiqueta="Llamadas hoy"       valor={m.llamadasHoy}                 color="coral"  />
      </div>

      <div className="dashboard__grid">
        <Card titulo="Valor por etapa">
          <PipelineChart />
        </Card>
        <Card titulo="Próximas citas">
          <ProximasCitas />
        </Card>
      </div>

      {/* Widget: Componer email rápido (visible solo si Google conectado) */}
      {googleConectado && conEmail.length > 0 && (
        <Card titulo="Componer email">
          <form className="compose-widget" onSubmit={handleEnviar}>
            <select
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              required
            >
              <option value="">Seleccionar prospecto…</option>
              {conEmail.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {p.email}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Escribe el mensaje…"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              rows={4}
              required
            />
            <Button type="submit" disabled={enviando}>
              <Send size={16} /> {enviando ? 'Enviando…' : 'Enviar email'}
            </Button>
          </form>
        </Card>
      )}

      <Card titulo="Pipeline" accion={<span className="muted">Arrastra para cambiar de etapa</span>}>
        <PipelineKanban />
      </Card>
    </div>
  );
}
