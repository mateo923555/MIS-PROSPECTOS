import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  titulo?: string;
  accion?: ReactNode;
}

export function Card({ children, className = '', titulo, accion }: Props) {
  return (
    <section className={`card ${className}`}>
      {(titulo || accion) && (
        <header className="card__head">
          {titulo && <h2 className="card__titulo">{titulo}</h2>}
          {accion}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
