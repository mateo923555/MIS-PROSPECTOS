import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useProspectosStore } from '@/store';
import { TIPOS_EVENTO } from '@/lib/constants';
import type { EventoAgendaInput, TipoEvento } from '@/types';

interface Props {
  fechaInicial?: string; // ISO
  onGuardar: (data: EventoAgendaInput) => void;
  onCancelar: () => void;
}

/** ISO -> valor para <input type="datetime-local"> (hora local). */
const aInput = (iso: string): string => {
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

export function EventoForm({ fechaInicial, onGuardar, onCancelar }: Props) {
  const prospectos = useProspectosStore((s) => s.prospectos);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(aInput(fechaInicial ?? new Date().toISOString()));
  const [tipo, setTipo] = useState<TipoEvento>('reunion');
  const [prospectoId, setProspectoId] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    onGuardar({
      titulo: titulo.trim(),
      fecha: new Date(fecha).toISOString(),
      tipo,
      completado: false,
      ...(prospectoId ? { prospectoId } : {}),
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <label className="form__campo">
        <span>Título *</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required autoFocus />
      </label>

      <div className="form__fila">
        <label className="form__campo">
          <span>Fecha y hora</span>
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
        <label className="form__campo">
          <span>Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoEvento)}>
            {Object.entries(TIPOS_EVENTO).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="form__campo">
        <span>Prospecto (opcional)</span>
        <select value={prospectoId} onChange={(e) => setProspectoId(e.target.value)}>
          <option value="">— Sin prospecto —</option>
          {prospectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </label>

      <div className="form__acciones">
        <Button type="button" variante="secundario" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
