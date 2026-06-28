import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Phone, StickyNote, Settings, Target, Upload, Trophy, FolderOpen,
} from 'lucide-react';
import { useUIStore } from '@/store';
import { importarProspectos } from '@/services/exportService';

const LINKS = [
  { to: '/', label: 'Dashboard', Icono: LayoutDashboard, end: true },
  { to: '/prospectos', label: 'Prospectos', Icono: Users },
  { to: '/agenda', label: 'Agenda', Icono: Calendar },
  { to: '/llamadas', label: 'Llamadas', Icono: Phone },
  { to: '/notas', label: 'Notas', Icono: StickyNote },
  { to: '/clientes', label: 'Clientes Cerrados', Icono: Trophy },
  { to: '/landings', label: 'Mis Landings', Icono: FolderOpen },
  { to: '/ajustes', label: 'Ajustes', Icono: Settings },
];

export function Sidebar() {
  const colapsado = useUIStore((s) => s.sidebarColapsado);
  const movilAbierto = useUIStore((s) => s.sidebarMovilAbierto);
  const cerrarMovil = useUIStore((s) => s.cerrarSidebarMovil);
  const notificar = useUIStore((s) => s.notificar);
  const refImport = useRef<HTMLInputElement>(null);

  const onArchivo = async (file: File) => {
    try {
      const res = await importarProspectos(file);
      notificar(`${res.importados} prospectos importados`, 'exito');
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Error al importar', 'error');
    }
  };

  return (
    <aside
      className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''} ${movilAbierto ? 'sidebar--movil-abierto' : ''}`}
    >
      <div className="sidebar__logo">
        <span className="sidebar__logo-icono">
          <Target size={20} />
        </span>
        {!colapsado && <span className="sidebar__logo-texto">Mi Prospectos</span>}
      </div>

      <nav className="sidebar__nav">
        {LINKS.map(({ to, label, Icono, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--activo' : ''}`
            }
            title={label}
            onClick={cerrarMovil}
          >
            <Icono size={20} />
            {!colapsado && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <input
          ref={refImport}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onArchivo(f);
            e.target.value = '';
          }}
        />
        <button
          className="sidebar__import"
          onClick={() => refImport.current?.click()}
          title="Importar prospectos (CSV)"
        >
          <Upload size={18} />
          {!colapsado && <span>Importar datos</span>}
        </button>
      </div>
    </aside>
  );
}
