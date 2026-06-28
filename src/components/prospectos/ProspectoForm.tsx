import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { ORDEN_ESTADOS, ESTADOS, ORIGENES, SERVICIOS } from '@/lib/constants';
import type { ProspectoInput, EstadoProspecto, OrigenProspecto, ServicioContratado } from '@/types';

interface Props {
  inicial?: Partial<ProspectoInput>;
  onGuardar: (data: ProspectoInput) => void;
  onCancelar: () => void;
}

const VACIO: ProspectoInput = {
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  rating: 0,
  reviews: 0,
  estado: 'nuevo',
  origen: 'web',
  valorEstimado: 0,
};

/** Formulario controlado para crear/editar un prospecto. */
export function ProspectoForm({ inicial, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState<ProspectoInput>({ ...VACIO, ...inicial });

  const set = <K extends keyof ProspectoInput>(k: K, v: ProspectoInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onGuardar(form);
  };

  return (
    <form className="form" onSubmit={submit}>
      <label className="form__campo">
        <span>Nombre *</span>
        <input
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          required
          autoFocus
        />
      </label>

      <div className="form__fila">
        <label className="form__campo">
          <span>Empresa</span>
          <input value={form.empresa} onChange={(e) => set('empresa', e.target.value)} />
        </label>
        <label className="form__campo">
          <span>Teléfono</span>
          <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </label>
      </div>

      <label className="form__campo">
        <span>Email</span>
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
      </label>

      <div className="form__fila">
        <label className="form__campo">
          <span>Dirección</span>
          <input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
        </label>
        <label className="form__campo">
          <span>Ciudad</span>
          <input value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} />
        </label>
      </div>

      <div className="form__fila">
        <label className="form__campo">
          <span>Rating (0–5)</span>
          <input
            type="number" min={0} max={5} step={0.1}
            value={form.rating}
            onChange={(e) => set('rating', Number(e.target.value))}
          />
        </label>
        <label className="form__campo">
          <span>Reseñas</span>
          <input
            type="number" min={0}
            value={form.reviews}
            onChange={(e) => set('reviews', Number(e.target.value))}
          />
        </label>
      </div>

      <div className="form__fila">
        <label className="form__campo">
          <span>Estado</span>
          <select
            value={form.estado}
            onChange={(e) => set('estado', e.target.value as EstadoProspecto)}
          >
            {ORDEN_ESTADOS.map((e) => (
              <option key={e} value={e}>{ESTADOS[e].label}</option>
            ))}
          </select>
        </label>
        <label className="form__campo">
          <span>Origen</span>
          <select
            value={form.origen}
            onChange={(e) => set('origen', e.target.value as OrigenProspecto)}
          >
            {Object.entries(ORIGENES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form__fila">
        <label className="form__campo">
          <span>Valor estimado</span>
          <input
            type="number"
            min={0}
            value={form.valorEstimado}
            onChange={(e) => set('valorEstimado', Number(e.target.value))}
          />
        </label>
        <label className="form__campo">
          <span>Servicio contratado</span>
          <select
            value={form.servicio ?? ''}
            onChange={(e) =>
              set('servicio', (e.target.value as ServicioContratado) || undefined)
            }
          >
            <option value="">— Sin especificar —</option>
            {Object.entries(SERVICIOS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form__acciones">
        <Button type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
