import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'fantasma' | 'peligro';
  tamano?: 'sm' | 'md';
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`btn btn--${variante} btn--${tamano} ${className}`}
      {...props}
    />
  );
}
