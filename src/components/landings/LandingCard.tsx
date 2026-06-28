import { ExternalLink, Trash2, Edit2, Copy } from 'lucide-react';
import type { Landing, EstadoLanding } from '@/types';

interface LandingCardProps {
  landing: Landing;
  onEdit: () => void;
  onDelete: () => void;
}

const ESTADO_STYLE: Record<EstadoLanding, string> = {
  desarrollo: 'badge badge--amarillo',
  deployada:  'badge badge--azul',
  vendida:    'badge badge--verde',
  archivada:  'badge badge--gris',
};

const ESTADO_LABEL: Record<EstadoLanding, string> = {
  desarrollo: 'En desarrollo',
  deployada:  'Deployada',
  vendida:    'Vendida',
  archivada:  'Archivada',
};

export function LandingCard({ landing, onEdit, onDelete }: LandingCardProps) {
  const copiarUrl = () => {
    navigator.clipboard.writeText(landing.url).catch(() => {});
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {/* Título y cliente */}
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem', lineHeight: 1.3 }}>
            {landing.nombre}
          </h3>
          {landing.cliente && (
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              Cliente: {landing.cliente}
            </p>
          )}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge">{landing.categoria}</span>
          <span className={ESTADO_STYLE[landing.estado]}>{ESTADO_LABEL[landing.estado]}</span>
        </div>

        {/* Tecnologías */}
        {landing.tecnologia.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {landing.tecnologia.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  background: 'var(--surface-2, var(--surface))',
                  borderRadius: 4,
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* URL */}
        <a
          href={landing.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            color: 'var(--cyan, #22d3ee)',
            wordBreak: 'break-all',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <ExternalLink size={12} />
          {landing.url}
        </a>

        {/* Descripción */}
        {landing.descripcion && (
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', flex: 1 }}>
            {landing.descripcion}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          justifyContent: 'flex-end',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        {landing.urlRepo && (
          <a
            href={landing.urlRepo}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver repo"
            style={{ padding: '6px', borderRadius: 6, display: 'flex', color: 'var(--muted)' }}
          >
            <span style={{fontSize:"0.7rem",fontWeight:700}}>GH</span>
          </a>
        )}
        <button
          onClick={copiarUrl}
          title="Copiar URL"
          style={{ padding: '6px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
        >
          <Copy size={16} />
        </button>
        <button
          onClick={onEdit}
          title="Editar"
          style={{ padding: '6px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cyan, #22d3ee)' }}
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={onDelete}
          title="Eliminar"
          style={{ padding: '6px', borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger, #f87171)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
