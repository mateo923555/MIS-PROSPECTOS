import type { LucideIcon } from 'lucide-react';

type Color = 'mint' | 'coral' | 'purple' | 'blue' | 'amber';

interface Props {
  Icono: LucideIcon;
  etiqueta: string;
  valor: string | number;
  color: Color;
}

export function StatCard({ Icono, etiqueta, valor, color }: Props) {
  return (
    <div className={`stat stat--${color} fade-up`}>
      <div className="stat__info">
        <span className="stat__valor">{valor}</span>
        <span className="stat__etiqueta">{etiqueta}</span>
      </div>
      <div className={`stat__icono stat__icono--${color}`}>
        <Icono size={22} />
      </div>
    </div>
  );
}
