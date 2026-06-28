import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Landing, LandingInput, ID } from '@/types';

interface LandingsState {
  landings: Landing[];
  agregar: (data: LandingInput) => Landing;
  actualizar: (id: ID, cambios: Partial<LandingInput>) => void;
  eliminar: (id: ID) => void;
  obtenerPorId: (id: ID) => Landing | undefined;
}

const ahora = () => new Date().toISOString();

export const useLandingsStore = create<LandingsState>()(
  persist(
    (set, get) => ({
      landings: [],

      agregar: (data) => {
        const landing: Landing = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: ahora(),
          updatedAt: ahora(),
        };
        set((s) => ({ landings: [landing, ...s.landings] }));
        return landing;
      },

      actualizar: (id, cambios) =>
        set((s) => ({
          landings: s.landings.map((l) =>
            l.id === id ? { ...l, ...cambios, updatedAt: ahora() } : l
          ),
        })),

      eliminar: (id) =>
        set((s) => ({ landings: s.landings.filter((l) => l.id !== id) })),

      obtenerPorId: (id) => get().landings.find((l) => l.id === id),
    }),
    { name: 'mp:landings' }
  )
);
