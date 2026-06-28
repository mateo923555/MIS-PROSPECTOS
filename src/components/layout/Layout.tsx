import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toasts } from './Toasts';
import { useUIStore } from '@/store';

/** Esqueleto de la app: sidebar + header + área de contenido. */
export function Layout() {
  const { pathname } = useLocation();
  const movilAbierto = useUIStore((s) => s.sidebarMovilAbierto);
  const cerrarMovil = useUIStore((s) => s.cerrarSidebarMovil);

  return (
    <div className="layout">
      <Sidebar />
      {movilAbierto && (
        <div
          className="layout__overlay"
          onClick={cerrarMovil}
          aria-hidden="true"
        />
      )}
      <div className="layout__main">
        <Header ruta={pathname} />
        <main className="layout__contenido">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
}
