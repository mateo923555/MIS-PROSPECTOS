import { useUIStore } from '@/store';

/** Pila de notificaciones efímeras (esquina inferior derecha). */
export function Toasts() {
  const toasts = useUIStore((s) => s.toasts);
  const descartar = useUIStore((s) => s.descartarToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.tipo}`}
          onClick={() => descartar(t.id)}
        >
          {t.mensaje}
        </div>
      ))}
    </div>
  );
}
