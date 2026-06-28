/**
 * Gmail REST API (v1).
 * - Enviar email desde una Nota
 * - Leer historial de threads de un prospecto
 */

import type { Nota, Prospecto } from '@/types';
import { formatEmailParaGmail } from './apiHelpers';
import { obtenerToken } from './googleAuthService';

const GMAIL = 'https://gmail.googleapis.com/gmail/v1/users/me';

// ---------------------------------------------------------------------------
// Tipos de display
// ---------------------------------------------------------------------------

export interface EmailThreadResumen {
  id: string;
  asunto: string;
  de: string;
  fecha: string;
  snippet: string;
}

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

function parseHeaders(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Envía el contenido de una nota como email al prospecto asociado.
 * Usa el campo `email` del prospecto como destinatario.
 */
export async function enviarEmailDesdNota(nota: Nota, prospecto: Prospecto): Promise<void> {
  if (!prospecto.email) throw new Error(`${prospecto.nombre} no tiene email registrado`);

  const draft = formatEmailParaGmail(nota, prospecto);
  const resp  = await gFetch(`${GMAIL}/messages/send`, {
    method: 'POST',
    body: JSON.stringify({ raw: draft.raw }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Error al enviar email (HTTP ${resp.status})`);
  }
}

/**
 * Compone y envía un email libre a un prospecto (desde el widget del dashboard).
 */
export async function enviarEmailLibre(
  destinatario: string,
  asunto: string,
  cuerpo: string,
  deEmail: string
): Promise<void> {
  const mime = [
    `From: ${deEmail}`,
    `To: ${destinatario}`,
    `Subject: ${asunto}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    cuerpo,
  ].join('\r\n');

  const bytes  = new TextEncoder().encode(mime);
  let bin      = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const raw    = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const resp = await gFetch(`${GMAIL}/messages/send`, {
    method: 'POST',
    body: JSON.stringify({ raw }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Error al enviar email (HTTP ${resp.status})`);
  }
}

/**
 * Devuelve hasta 5 mensajes que involucran el email del prospecto,
 * con asunto, remitente, fecha y snippet.
 */
export async function obtenerThreadsDeProspecto(
  email: string
): Promise<EmailThreadResumen[]> {
  const q     = encodeURIComponent(`from:${email} OR to:${email}`);
  const resp  = await gFetch(`${GMAIL}/messages?q=${q}&maxResults=5`);
  if (!resp.ok) throw new Error(`Error al leer Gmail (HTTP ${resp.status})`);

  const lista = await resp.json() as { messages?: Array<{ id: string }> };
  const msgs  = lista.messages ?? [];
  if (msgs.length === 0) return [];

  const detalle = await Promise.all(
    msgs.map(async ({ id }) => {
      const r = await gFetch(
        `${GMAIL}/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`
      );
      if (!r.ok) return null;
      const m = await r.json() as {
        id: string;
        snippet?: string;
        payload?: { headers?: Array<{ name: string; value: string }> };
      };
      const hdrs = m.payload?.headers ?? [];
      return {
        id: m.id,
        asunto: parseHeaders(hdrs, 'Subject') || '(sin asunto)',
        de:     parseHeaders(hdrs, 'From'),
        fecha:  parseHeaders(hdrs, 'Date'),
        snippet: m.snippet ?? '',
      } as EmailThreadResumen;
    })
  );

  return detalle.filter((d): d is EmailThreadResumen => d !== null);
}
