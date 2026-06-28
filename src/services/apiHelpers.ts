import type { EventoAgenda, EventoAgendaInput, Nota, NotaInput, Prospecto, TipoEvento } from '@/types';
import { TIPOS_EVENTO } from '@/lib/constants';

/**
 * Conversores entre el modelo local y los formatos de Google Calendar / Gmail.
 * Son funciones puras: NO hacen llamadas de red. Sirven de base para cuando se
 * conecte la API real (sólo habrá que pasar estos objetos al cliente de Google).
 */

const ZONA = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Argentina/Buenos_Aires';
const DURACION_DEFAULT_MIN = 60;

// ---------------------------------------------------------------------------
// Google Calendar
// ---------------------------------------------------------------------------

/** Recurso de evento de Google Calendar (campos que usamos). */
export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  extendedProperties?: { private: Record<string, string> };
}

/** AgendaEvent -> recurso de Google Calendar. */
export function formatEventoParaGoogleCalendar(
  evento: EventoAgenda,
  duracionMin = DURACION_DEFAULT_MIN
): GoogleCalendarEvent {
  const inicio = new Date(evento.fecha);
  const fin = new Date(inicio.getTime() + duracionMin * 60000);
  return {
    summary: evento.titulo,
    description: `Tipo: ${TIPOS_EVENTO[evento.tipo]}${evento.completado ? ' (completado)' : ''}`,
    start: { dateTime: inicio.toISOString(), timeZone: ZONA },
    end: { dateTime: fin.toISOString(), timeZone: ZONA },
    // Guardamos metadata para poder re-sincronizar sin perder el tipo.
    extendedProperties: { private: { tipo: evento.tipo, origen: 'mi-prospectos' } },
  };
}

/** Recurso de Google Calendar -> EventoAgendaInput. */
export function parseGoogleCalendarEvent(ev: GoogleCalendarEvent): EventoAgendaInput {
  const fechaRaw = ev.start?.dateTime;
  const fecha = fechaRaw && !Number.isNaN(new Date(fechaRaw).getTime())
    ? new Date(fechaRaw).toISOString()
    : new Date().toISOString();
  const tipoMeta = ev.extendedProperties?.private?.tipo;
  const tipo: TipoEvento =
    tipoMeta && tipoMeta in TIPOS_EVENTO ? (tipoMeta as TipoEvento) : 'otro';
  return {
    titulo: ev.summary || '(sin título)',
    fecha,
    tipo,
    completado: false,
  };
}

// ---------------------------------------------------------------------------
// Gmail
// ---------------------------------------------------------------------------

/** Borrador de Gmail listo para enviar al endpoint users.drafts.create. */
export interface GmailDraft {
  to: string;
  subject: string;
  body: string;
  /** MIME RFC 2822 codificado en base64url (campo message.raw de la API). */
  raw: string;
}

/** Codifica texto UTF-8 a base64url (formato que pide la API de Gmail). */
function base64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Nota -> borrador de email de Gmail (destinatario = email del prospecto). */
export function formatEmailParaGmail(nota: Nota, prospecto?: Prospecto): GmailDraft {
  const to = prospecto?.email ?? '';
  const subject = prospecto
    ? `Seguimiento — ${prospecto.nombre}`
    : 'Seguimiento';
  const body = nota.contenido;
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n');
  return { to, subject, body, raw: base64Url(mime) };
}

interface GmailMessage {
  snippet?: string;
  payload?: { headers?: Array<{ name: string; value: string }> };
}

/** Estructura mínima de un hilo de Gmail (lo que consumimos). */
export interface GmailThread {
  messages?: GmailMessage[];
}

const header = (msg: GmailMessage, name: string) =>
  msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

/** Hilo de Gmail -> NotaInput (resumen del intercambio). */
export function parseGmailThread(thread: GmailThread, prospectoId?: string): NotaInput {
  const primero = thread.messages?.[0];
  const asunto = primero ? header(primero, 'Subject') : '';
  const de = primero ? header(primero, 'From') : '';
  const cuerpo = thread.messages
    ?.map((m) => m.snippet?.trim())
    .filter(Boolean)
    .join('\n— ') ?? '';

  const contenido = [
    asunto && `Asunto: ${asunto}`,
    de && `De: ${de}`,
    cuerpo,
  ].filter(Boolean).join('\n');

  return {
    contenido: contenido || '(hilo de email vacío)',
    fijada: false,
    etiquetas: ['email'],
    ...(prospectoId ? { prospectoId } : {}),
  };
}
