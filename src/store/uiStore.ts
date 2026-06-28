import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tema, Toast } from '@/types';

/**
 * Estado de interfaz: tema, colapso del sidebar y toasts efímeros.
 * Sólo se persisten las preferencias (tema, sidebar, google, notif); los toasts no.
 */
interface UIState {
  tema: Tema;
  sidebarColapsado: boolean;
  /** Drawer del sidebar en móvil (off-canvas). No se persiste. */
  sidebarMovilAbierto: boolean;
  toasts: Toast[];
  /** Búsqueda global compartida por el header y la lista de prospectos. */
  busqueda: string;
  /** true cuando hay token de Google válido en caché. */
  googleConectado: boolean;
  /** true cuando el usuario concedió permiso de notificaciones del navegador. */
  notificacionesOk: boolean;

  alternarTema: () => void;
  alternarSidebar: () => void;
  alternarSidebarMovil: () => void;
  cerrarSidebarMovil: () => void;
  setBusqueda: (q: string) => void;
  setGoogleConectado: (v: boolean) => void;
  setNotificacionesOk: (v: boolean) => void;

  notificar: (mensaje: string, tipo?: Toast['tipo']) => void;
  descartarToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      tema: 'oscuro',
      sidebarColapsado: false,
      sidebarMovilAbierto: false,
      toasts: [],
      busqueda: '',
      googleConectado: false,
      notificacionesOk: false,

      alternarTema: () =>
        set((s) => ({ tema: s.tema === 'claro' ? 'oscuro' : 'claro' })),

      alternarSidebar: () =>
        set((s) => ({ sidebarColapsado: !s.sidebarColapsado })),

      alternarSidebarMovil: () =>
        set((s) => ({ sidebarMovilAbierto: !s.sidebarMovilAbierto })),

      cerrarSidebarMovil: () => set({ sidebarMovilAbierto: false }),

      setBusqueda: (q) => set({ busqueda: q }),
      setGoogleConectado: (v) => set({ googleConectado: v }),
      setNotificacionesOk: (v) => set({ notificacionesOk: v }),

      notificar: (mensaje, tipo = 'info') => {
        const toast: Toast = { id: crypto.randomUUID(), mensaje, tipo };
        set((s) => ({ toasts: [...s.toasts, toast] }));
        // Auto-descarte a los 3s.
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toast.id) }));
        }, 3000);
      },

      descartarToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'mp:ui',
      // Sólo preferencias persistentes; los toasts son efímeros.
      partialize: (s) => ({
        tema: s.tema,
        sidebarColapsado: s.sidebarColapsado,
        googleConectado: s.googleConectado,
        notificacionesOk: s.notificacionesOk,
      }),
    }
  )
);
