import { useMemo, useState } from 'react';
import { Plus, Trash2, Phone } from 'lucide-react';
import { useLlamadasStore, useProspectosStore, useUIStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { formatFechaHora } from '@/lib/format';
import { RESULTADOS } from '@/lib/constants';
import type { ResultadoLlamada } from '@/types';

/** Clasifica el resultado para colorear el borde de la tarjeta. */
const claseResultado = (r: ResultadoLlamada): 'exito' | 'fallo' | 'neutro' => {
  if (r === 'contestada' || r === 'interesado') return 'exito';
  if (r === 'reagendar') return 'neutro';
  return 'fallo';
};

export function LlamadasPage() {
  const llamadas = useLlamadasStore((s) => s.llamadas);
  const agregar = useLlamadasStore((s) => s.agregar);
  const eliminar = useLlamadasStore((s) => s.eliminar);
  const prospectos = useProspectosStore((s) => s.prospectos);
  const notificar = useUIStore((s) => s.notificar);

  const [abierto, setAbierto] = useState(false);
  const [prospectoId, setProspectoId] = useState('');
  const [duracion, setDuracion] = useState(5);
  const [resultado, setResultado] = useState<ResultadoLlamada>('contestada');

  const nombre = useMemo(
    () => new Map(prospectos.map((p) => [p.id, p.nombre])),
    [prospectos]
  );
  const ordenadas = useMemo(
    () => [...llamadas].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [llamadas]
  );

  const registrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectoId) return;
    agregar({ prospectoId, fecha: new Date().toISOString(), duracion, resultado });
    setAbierto(false);
    setProspectoId('');
    notificar('Llamada registrada', 'exito');
  };

  return (
    <div>
      <div className="prospectos__barra">
        <span className="muted">{ordenadas.length} llamada(s) registradas</span>
        <Button onClick={() => setAbierto(true)} disabled={prospectos.length === 0} style={{ marginLeft: 'auto' }}>
          <Plus size={16} /> Registrar llamada
        </Button>
      </div>

      {ordenadas.length === 0 ? (
        <EmptyState icono={<Phone size={32} />} titulo="Sin llamadas registradas" />
      ) : (
        <div className="llamadas-grid">
          {ordenadas.map((l) => {
            const cls = claseResultado(l.resultado);
            return (
              <article key={l.id} className={`llamada llamada--${cls} fade-up`}>
                <div className="llamada__top">
                  <span className="llamada__nombre">{nombre.get(l.prospectoId) ?? '—'}</span>
                  <button
                    className="tabla__borrar"
                    onClick={() => eliminar(l.id)}
                    aria-label="Eliminar llamada"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="llamada__duracion">
                  {l.duracion} <small>min</small>
                </div>
                <div className="llamada__foot">
                  <span className="llamada__resultado">{RESULTADOS[l.resultado]}</span>
                  <span className="llamada__fecha">{formatFechaHora(l.fecha)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal abierto={abierto} titulo="Registrar llamada" onCerrar={() => setAbierto(false)}>
        <form className="form" onSubmit={registrar}>
          <label className="form__campo">
            <span>Prospecto *</span>
            <select value={prospectoId} onChange={(e) => setProspectoId(e.target.value)} required>
              <option value="">— Selecciona —</option>
              {prospectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <div className="form__fila">
            <label className="form__campo">
              <span>Duración (min)</span>
              <input type="number" min={0} value={duracion} onChange={(e) => setDuracion(Number(e.target.value))} />
            </label>
            <label className="form__campo">
              <span>Resultado</span>
              <select value={resultado} onChange={(e) => setResultado(e.target.value as ResultadoLlamada)}>
                {Object.entries(RESULTADOS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form__acciones">
            <Button type="button" variante="secundario" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
