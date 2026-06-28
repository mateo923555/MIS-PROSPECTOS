import { useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useUIStore } from '@/store';

const TITULOS: Record<string, string> = {
  '/': 'Dashboard',
  '/prospectos': 'Prospectos',
  '/agenda': 'Agenda',
  '/llamadas': 'Llamadas',
  '/notas': 'Notas',
  '/clientes': 'Clientes Cerrados',
  '/ajustes': 'Ajustes',
};

export function Header({ ruta }: { ruta: string }) {
  const navigate = useNavigate();
  const alternarSidebar = useUIStore((s) => s.alternarSidebar);
  const alternarSidebarMovil = useUIStore((s) => s.alternarSidebarMovil);
  const busqueda = useUIStore((s) => s.busqueda);
  const setBusqueda = useUIStore((s) => s.setBusqueda);

  const onMenu = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches) {
      alternarSidebarMovil();
    } else {
      alternarSidebar();
    }
  };

  return (
    <header className="header">
      <div className="header__izq">
        <button className="header__menu" onClick={onMenu} aria-label="Alternar menú">
          <Menu size={20} />
        </button>
        <h1 className="header__titulo">{TITULOS[ruta] ?? 'Mi Prospectos'}</h1>
      </div>

      <div className="header__der">
        <div className="header__search">
          <Search size={16} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => ruta !== '/prospectos' && navigate('/prospectos')}
            placeholder="Buscar prospectos…"
            aria-label="Buscar prospectos"
          />
        </div>
      </div>
    </header>
  );
}
