import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Llamada, LlamadaInput, ID, ISODate } from '@/types';
import { useProspectosStore } from './prospectosStore';

/**
 * Store de llamadas. Al registrar una llamada se actualiza también el
 * `ultimoContacto` del prospecto (efecto cruzado controlado).
 */
interface LlamadasState {
  llamadas: Llamada[];

  agregar: (data: LlamadaInput) => Llamada;
  actualizar: (id: ID, cambios: Partial<LlamadaInput>) => void;
  eliminar: (id: ID) => void;

  /** Llamadas de un prospecto, de la más reciente a la más antigua. */
  porProspecto: (prospectoId: ID) => Llamada[];
}

const ahora = (): ISODate => new Date().toISOString();

export const useLlamadasStore = create<LlamadasState>()(
  persist(
    (set, get) => ({
      llamadas: [],

      agregar: (data) => {
        const llamada: Llamada = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: ahora(),
          updatedAt: ahora(),
        };
        set((s) => ({ llamadas: [llamada, ...s.llamadas] }));
        // Efecto cruzado: el prospecto registra este contacto.
        useProspectosStore.getState().registrarContacto(data.prospectoId, data.fecha);
        return llamada;
      },

      actualizar: (id, cambios) =>
        set((s) => ({
          llamadas: s.llamadas.map((l) =>
            l.id === id ? { ...l, ...cambios, updatedAt: ahora() } : l
          ),
        })),

      eliminar: (id) =>
        set((s) => ({ llamadas: s.llamadas.filter((l) => l.id !== id) })),

      porProspecto: (prospectoId) =>
        get()
          .llamadas.filter((l) => l.prospectoId === prospectoId)
          .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    }),
    { name: 'mp:llamadas' }
  )
);
