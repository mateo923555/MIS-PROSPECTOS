import { useState, useEffect } from 'react';
import { useLandingsStore } from '@/store';
import type { LandingInput, CategoriaLanding, EstadoLanding } from '@/types';
import { Button } from '@/components/common/Button';

interface LandingFormProps {
  editingId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIAS: { value: CategoriaLanding; label: string }[] = [
  { value: 'electricista', label: 'Electricista' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'abogado', label: 'Abogado' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'salon', label: 'Salón' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'otro', label: 'Otro' },
];

const ESTADOS: { value: EstadoLanding; label: string }[] = [
  { value: 'desarrollo', label: 'En desarrollo' },
  { value: 'deployada', label: 'Deployada' },
  { value: 'vendida', label: 'Vendida' },
  { value: 'archivada', label: 'Archivada' },
];

export function LandingForm({ editingId, onClose, onSuccess }: LandingFormProps) {
  const agregar = useLandingsStore((s) => s.agregar);
  const actualizar = useLandingsStore((s) => s.actualizar);
  const obtenerPorId = useLandingsStore((s) => s.obtenerPorId);

  const [form, setForm] = useState<Partial<LandingInput>>({
    nombre: '',
    url: '',
    categoria: 'otro',
    estado: 'desarrollo',
    tecnologia: [],
  });

  useEffect(() => {
    if (editingId) {
      const landing = obtenerPorId(editingId);
      if (landing) {
        setForm({
          nombre: landing.nombre,
          descripcion: landing.descripcion,
          url: landing.url,
          urlRepo: landing.urlRepo,
          cliente: landing.cliente,
          categoria: landing.categoria,
          estado: landing.estado,
          tecnologia: landing.tecnologia,
          notas: landing.notas,
        });
      }
    }
  }, [editingId, obtenerPorId]);

  const set = (patch: Partial<LandingInput>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre?.trim() || !form.url?.trim()) return;

    if (editingId) {
      actualizar(editingId, form as Partial<LandingInput>);
    } else {
      agregar({
        nombre: form.nombre!.trim(),
        url: form.url!.trim(),
        categoria: form.categoria ?? 'otro',
        estado: form.estado ?? 'desarrollo',
        tecnologia: form.tecnologia ?? [],
        descripcion: form.descripcion,
        urlRepo: form.urlRepo,
        cliente: form.cliente,
        notas: form.notas,
        fechaCreacion: new Date().toISOString(),
      });
    }
    onSuccess();
  };

  const inputClass =
    'w-full px-3 py-2 rounded text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            value={form.nombre ?? ''}
            onChange={(e) => set({ nombre: e.target.value })}
            placeholder="Landing Electricista CABA"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <input
            type="text"
            value={form.cliente ?? ''}
            onChange={(e) => set({ cliente: e.target.value })}
            placeholder="Nombre del cliente"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL Deployada *</label>
        <input
          type="url"
          value={form.url ?? ''}
          onChange={(e) => set({ url: e.target.value })}
          placeholder="https://landing-electricista.vercel.app"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Repo GitHub</label>
        <input
          type="url"
          value={form.urlRepo ?? ''}
          onChange={(e) => set({ urlRepo: e.target.value })}
          placeholder="https://github.com/user/proyecto"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select
            value={form.categoria}
            onChange={(e) => set({ categoria: e.target.value as CategoriaLanding })}
            className={inputClass}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={form.estado}
            onChange={(e) => set({ estado: e.target.value as EstadoLanding })}
            className={inputClass}
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tecnologías (comas)</label>
        <input
          type="text"
          value={form.tecnologia?.join(', ') ?? ''}
          onChange={(e) =>
            set({ tecnologia: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
          }
          placeholder="React, Tailwind, Framer Motion"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={form.descripcion ?? ''}
          onChange={(e) => set({ descripcion: e.target.value })}
          placeholder="Detalles sobre la landing..."
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variante="secundario" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingId ? 'Actualizar' : 'Guardar'} Landing
        </Button>
      </div>
    </form>
  );
}
