import { useMemo, useState } from 'react';
import { Plus, Pin, PinOff, Trash2, StickyNote, Mail } from 'lucide-react';
import { useNotasStore, useUIStore, useProspectosStore } from '@/store';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatFecha } from '@/lib/format';
import { enviarEmailDesdNota } from '@/services/gmailService';
import type { Nota } from '@/types';

export function NotasPage() {
  const notas          = useNotasStore((s) => s.notas);
  const agregar        = useNotasStore((s) => s.agregar);
  const eliminar       = useNotasStore((s) => s.eliminar);
  const alternarFijada = useNotasStore((s) => s.alternarFijada);
  const notificar      = useUIStore((s) => s.notificar);
  const googleConectado = useUIStore((s) => s.googleConectado);
  const prospectos     = useProspectosStore((s) => s.prospectos);

  const [texto, setTexto]           = useState('');
  const [enviando, setEnviando]     = useState<string | null>(null); // notaId

  const ordenadas = useMemo(
    () =>
      [...notas].sort((a, b) => {
        if (a.fijada !== b.fijada) return a.fijada ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      }),
    [notas]
  );

  const crear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    agregar({ contenido: texto.trim(), fijada: false, etiquetas: [] });
    setTexto('');
    notificar('Nota creada', 'exito');
  };

  const handleEnviarEmail = async (nota: Nota) => {
    const prospecto = nota.prospectoId
      ? prospectos.find((p) => p.id === nota.prospectoId)
      : undefined;

    if (!prospecto?.email) {
      notificar('Esta nota no tiene prospecto con email asignado', 'error');
      return;
    }

    setEnviando(nota.id);
    try {
      await enviarEmailDesdNota(nota, prospecto);
      notificar(`Email enviado a ${prospecto.email}`, 'exito');
    } catch (err) {
      notificar(err instanceof Error ? err.message : 'Error al enviar email', 'error');
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div>
      <form className="nota-form" onSubmit={crear}>
        <textarea
          placeholder="Escribe una nota…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
        />
        <Button type="submit"><Plus size={16} /> Agregar nota</Button>
      </form>

      {ordenadas.length === 0 ? (
        <EmptyState icono={<StickyNote size={32} />} titulo="Sin notas" />
      ) : (
        <div className="notas-grid">
          {ordenadas.map((n) => {
            const prospecto = n.prospectoId
              ? prospectos.find((p) => p.id === n.prospectoId)
              : undefined;
            const tieneEmail = googleConectado && !!prospecto?.email;

            return (
              <article key={n.id} className={`nota ${n.fijada ? 'nota--fijada' : ''}`}>
                {prospecto && (
                  <div className="nota__prospecto">{prospecto.nombre}</div>
                )}
                <p className="nota__contenido">{n.contenido}</p>
                <footer className="nota__pie">
                  <span className="muted">{formatFecha(n.updatedAt)}</span>
                  <div className="nota__acciones">
                    {tieneEmail && (
                      <button
                        onClick={() => handleEnviarEmail(n)}
                        title={`Enviar como email a ${prospecto!.email}`}
                        aria-label="Enviar como email"
                        disabled={enviando === n.id}
                        className={enviando === n.id ? 'nota__accion--loading' : ''}
                      >
                        <Mail size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => alternarFijada(n.id)}
                      title={n.fijada ? 'Desfijar' : 'Fijar'}
                      aria-label="Fijar nota"
                    >
                      {n.fijada ? <Pin size={15} /> : <PinOff size={15} />}
                    </button>
                    <button
                      onClick={() => eliminar(n.id)}
                      title="Eliminar"
                      aria-label="Eliminar nota"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
