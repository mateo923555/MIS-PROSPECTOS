/**
 * Google Calendar REST API (v3).
 * Sincroniza eventos locales ↔ Google Calendar.
 */

import type { EventoAgenda } from '@/types';
import { useAgendaStore } from '@/store';
import { formatEventoParaGoogleCalendar, parseGoogleCalendarEvent } from './apiHelpers';
import { obtenerToken } from './googleAuthService';

const BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function gFetch(url: string, opts?: RequestInit): Promise<Response> {
  const token = await obtenerToken();
  return fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...((opts?.headers as Record<string, string>) ?? {}),
    },
  });
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export interface SyncResultado {
  subidos: number;
  errores: number;
}

/**
 * Envía todos los eventos locales a Google Calendar.
 * - Si ya tiene `googleCalendarId`, hace PUT (actualiza).
 * - Si no, hace POST (crea) y guarda el ID devuelto en el store.
 */
export async function sincronizarHaciaGoogle(
  eventos: EventoAgenda[]
): Promise<SyncResultado> {
  let subidos = 0;
  let errores = 0;

  for (const ev of eventos) {
    // Agrega recordatorio de 15 min al evento de Google Calendar
    const cuerpo = {
      ...formatEventoParaGoogleCalendar(ev),
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 15 }],
      },
    };

    try {
      let resp: Response;
      if (ev.googleCalendarId) {
        resp = await gFetch(`${BASE}/${ev.googleCalendarId}`, {
          method: 'PUT',
          body: JSON.stringify(cuerpo),
        });
      } else {
        resp = await gFetch(BASE, {
          method: 'POST',
          body: JSON.stringify(cuerpo),
        });
      }

      if (resp.ok) {
        const data = await resp.json() as { id?: string };
        // Guarda el Google Calendar ID en el evento local si es nuevo
        if (data.id && !ev.googleCalendarId) {
          useAgendaStore.getState().actualizar(ev.id, { googleCalendarId: data.id });
        }
        subidos++;
      } else {
        errores++;
      }
    } catch {
      errores++;
    }
  }

  return { subidos, errores };
}

/**
 * Importa eventos de Google Calendar (próximos 2 meses) al store local.
 * Omite los que ya existen (compara por googleCalendarId).
 * Devuelve la cantidad de eventos nuevos importados.
 */
export async function importarDesdeGoogle(): Promise<number> {
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 días
  const params  = new URLSearchParams({ timeMin, timeMax, maxResults: '50', singleEvents: 'true', orderBy: 'startTime' });

  const resp = await gFetch(`${BASE}?${params}`);
  if (!resp.ok) throw new Error(`Error al leer Google Calendar (HTTP ${resp.status})`);

  const data = await resp.json() as { items?: Array<{ id?: string } & object> };
  const items = data.items ?? [];

  const store      = useAgendaStore.getState();
  const idsExist   = new Set(store.eventos.map((e) => e.googleCalendarId).filter(Boolean));
  let importados   = 0;

  for (const item of items) {
    const gcId = (item as { id?: string }).id;
    if (gcId && idsExist.has(gcId)) continue; // ya existe localmente

    const input = parseGoogleCalendarEvent(item as Parameters<typeof parseGoogleCalendarEvent>[0]);
    const nuevo = store.agregar(input);
    if (gcId) {
      store.actualizar(nuevo.id, { googleCalendarId: gcId });
    }
    importados++;
  }

  return importados;
}
