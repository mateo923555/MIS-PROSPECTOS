import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EventoAgenda, EventoAgendaInput, ID, ISODate } from '@/types';

/**
 * Store de la agenda: eventos/citas con o sin prospecto asociado.
 */
interface AgendaState {
  eventos: EventoAgenda[];

  agregar: (data: EventoAgendaInput) => EventoAgenda;
  actualizar: (id: ID, cambios: Partial<EventoAgendaInput>) => void;
  eliminar: (id: ID) => void;
  alternarCompletado: (id: ID) => void;

  /** Eventos ordenados por fecha ascendente. */
  ordenados: () => EventoAgenda[];
  porProspecto: (prospectoId: ID) => EventoAgenda[];
}

const ahora = (): ISODate => new Date().toISOString();

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set, get) => ({
      eventos: [],

      agregar: (data) => {
        const evento: EventoAgenda = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: ahora(),
          updatedAt: ahora(),
        };
        set((s) => ({ eventos: [evento, ...s.eventos] }));
        return evento;
      },

      actualizar: (id, cambios) =>
        set((s) => ({
          eventos: s.eventos.map((e) =>
            e.id === id ? { ...e, ...cambios, updatedAt: ahora() } : e
          ),
        })),

      eliminar: (id) =>
        set((s) => ({ eventos: s.eventos.filter((e) => e.id !== id) })),

      alternarCompletado: (id) =>
        set((s) => ({
          eventos: s.eventos.map((e) =>
            e.id === id ? { ...e, completado: !e.completado, updatedAt: ahora() } : e
          ),
        })),

      ordenados: () =>
        [...get().eventos].sort((a, b) => a.fecha.localeCompare(b.fecha)),

      porProspecto: (prospectoId) =>
        get().eventos.filter((e) => e.prospectoId === prospectoId),
    }),
    { name: 'mp:agenda' }
  )
);
