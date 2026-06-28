import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prospecto, ProspectoInput, EstadoProspecto, ID, ISODate } from '@/types';

/**
 * Store de prospectos: CRUD + cambios de estado del embudo.
 * Es la fuente de verdad del dominio; otros stores (llamadas, agenda)
 * pueden tocar `ultimoContacto` a través de `registrarContacto`.
 */
interface ProspectosState {
  prospectos: Prospecto[];

  agregar: (data: ProspectoInput) => Prospecto;
  actualizar: (id: ID, cambios: Partial<ProspectoInput>) => void;
  eliminar: (id: ID) => void;
  cambiarEstado: (id: ID, estado: EstadoProspecto) => void;
  /** Marca un contacto reciente (lo usan llamadas/agenda). */
  registrarContacto: (id: ID, fecha: ISODate) => void;

  obtenerPorId: (id: ID) => Prospecto | undefined;
}

const ahora = (): ISODate => new Date().toISOString();

export const useProspectosStore = create<ProspectosState>()(
  persist(
    (set, get) => ({
      prospectos: [],

      agregar: (data) => {
        const prospecto: Prospecto = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: ahora(),
          updatedAt: ahora(),
        };
        set((s) => ({ prospectos: [prospecto, ...s.prospectos] }));
        return prospecto;
      },

      actualizar: (id, cambios) =>
        set((s) => ({
          prospectos: s.prospectos.map((p) =>
            p.id === id ? { ...p, ...cambios, updatedAt: ahora() } : p
          ),
        })),

      eliminar: (id) =>
        set((s) => ({ prospectos: s.prospectos.filter((p) => p.id !== id) })),

      cambiarEstado: (id, estado) =>
        set((s) => ({
          prospectos: s.prospectos.map((p) =>
            p.id === id ? { ...p, estado, updatedAt: ahora() } : p
          ),
        })),

      registrarContacto: (id, fecha) =>
        set((s) => ({
          prospectos: s.prospectos.map((p) =>
            p.id === id ? { ...p, ultimoContacto: fecha, updatedAt: ahora() } : p
          ),
        })),

      obtenerPorId: (id) => get().prospectos.find((p) => p.id === id),
    }),
    { name: 'mp:prospectos' }
  )
);
