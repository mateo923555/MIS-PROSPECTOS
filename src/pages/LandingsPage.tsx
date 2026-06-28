import { useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { useLandingsStore } from '@/store';
import type { CategoriaLanding, EstadoLanding } from '@/types';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { LandingForm } from '@/components/landings/LandingForm';
import { LandingCard } from '@/components/landings/LandingCard';

const CATEGORIAS: CategoriaLanding[] = [
  'electricista', 'barbershop', 'abogado', 'dentista', 'salon', 'restaurante', 'otro',
];

const ESTADOS: EstadoLanding[] = ['desarrollo', 'deployada', 'vendida', 'archivada'];

export function LandingsPage() {
  const landings = useLandingsStore((s) => s.landings);
  const eliminar = useLandingsStore((s) => s.eliminar);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaLanding | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoLanding | null>(null);

  const landingsFiltradas = landings.filter((l) => {
    if (filtroCategoria && l.categoria !== filtroCategoria) return false;
    if (filtroEstado && l.estado !== filtroEstado) return false;
    return true;
  });

  const chipBase = 'px-3 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors';
  const chipActivo = 'bg-[var(--accent)] text-white border-[var(--accent)]';
  const chipInactivo = 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent)]';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>Mis Landings</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            {landingsFiltradas.length} de {landings.length} landing{landings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Nueva Landing
        </Button>
      </div>

      {/* Formulario inline */}
      {showForm && (
        <Card titulo={editingId ? 'Editar Landing' : 'Nueva Landing'}>
          <LandingForm
            editingId={editingId}
            onClose={() => { setShowForm(false); setEditingId(null); }}
            onSuccess={() => { setShowForm(false); setEditingId(null); }}
          />
        </Card>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 70 }}>Categoría:</span>
          <button
            onClick={() => setFiltroCategoria(null)}
            className={`${chipBase} ${filtroCategoria === null ? chipActivo : chipInactivo}`}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat === filtroCategoria ? null : cat)}
              className={`${chipBase} ${filtroCategoria === cat ? chipActivo : chipInactivo}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 70 }}>Estado:</span>
          <button
            onClick={() => setFiltroEstado(null)}
            className={`${chipBase} ${filtroEstado === null ? chipActivo : chipInactivo}`}
          >
            Todos
          </button>
          {ESTADOS.map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est === filtroEstado ? null : est)}
              className={`${chipBase} ${filtroEstado === est ? chipActivo : chipInactivo}`}
              style={{ textTransform: 'capitalize' }}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {landingsFiltradas.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <FolderOpen size={48} style={{ margin: '0 auto 1rem', color: 'var(--muted)' }} />
            <p style={{ color: 'var(--muted)' }}>
              {landings.length === 0
                ? 'Sin landings. Creá una nueva para empezar.'
                : 'No hay landings con esos filtros.'}
            </p>
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {landingsFiltradas.map((landing) => (
            <LandingCard
              key={landing.id}
              landing={landing}
              onEdit={() => {
                setEditingId(landing.id);
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={() => eliminar(landing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
