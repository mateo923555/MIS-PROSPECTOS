import type { ReactNode } from 'react';

interface Props {
  icono: ReactNode;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EmptyState({ icono, titulo, descripcion, accion }: Props) {
  return (
    <div className="empty fade-up">
      <div className="empty__icono">{icono}</div>
      <p className="empty__titulo">{titulo}</p>
      {descripcion && <p className="empty__desc">{descripcion}</p>}
      {accion && <div className="empty__accion">{accion}</div>}
    </div>
  );
}
