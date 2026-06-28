import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Nota, NotaInput, ID, ISODate } from '@/types';

/**
 * Store de notas. Las notas fijadas (`fijada`) se muestran primero.
 */
interface NotasState {
  notas: Nota[];

  agregar: (data: NotaInput) => Nota;
  actualizar: (id: ID, cambios: Partial<NotaInput>) => void;
  eliminar: (id: ID) => void;
  alternarFijada: (id: ID) => void;

  /** Notas ordenadas: fijadas primero, luego por fecha de actualización. */
  ordenadas: () => Nota[];
  porProspecto: (prospectoId: ID) => Nota[];
}

const ahora = (): ISODate => new Date().toISOString();

export const useNotasStore = create<NotasState>()(
  persist(
    (set, get) => ({
      notas: [],

      agregar: (data) => {
        const nota: Nota = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: ahora(),
          updatedAt: ahora(),
        };
        set((s) => ({ notas: [nota, ...s.notas] }));
        return nota;
      },

      actualizar: (id, cambios) =>
        set((s) => ({
          notas: s.notas.map((n) =>
            n.id === id ? { ...n, ...cambios, updatedAt: ahora() } : n
          ),
        })),

      eliminar: (id) =>
        set((s) => ({ notas: s.notas.filter((n) => n.id !== id) })),

      alternarFijada: (id) =>
        set((s) => ({
          notas: s.notas.map((n) =>
            n.id === id ? { ...n, fijada: !n.fijada, updatedAt: ahora() } : n
          ),
        })),

      ordenadas: () =>
        [...get().notas].sort((a, b) => {
          if (a.fijada !== b.fijada) return a.fijada ? -1 : 1;
          return b.updatedAt.localeCompare(a.updatedAt);
        }),

      porProspecto: (prospectoId) =>
        get().notas.filter((n) => n.prospectoId === prospectoId),
    }),
    { name: 'mp:notas' }
  )
);
