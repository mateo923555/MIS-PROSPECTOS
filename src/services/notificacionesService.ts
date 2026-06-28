/**
 * Notificaciones del navegador + recordatorios por email.
 *
 * - Browser notifications: 15 min antes de cada evento (funciona mientras el tab esté abierto).
 * - Email reminders: al abrir la app, si hay eventos en la próxima hora y Gmail está conectado.
 */

import type { EventoAgenda } from '@/types';

const REMINDERS_KEY = 'mp:reminders_sent'; // Set<"eventoId:YYYY-MM-DD"> en JSON

// ---------------------------------------------------------------------------
// Permisos
// ---------------------------------------------------------------------------

export async function pedirPermiso(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied')  return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function tienePermiso(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

// ---------------------------------------------------------------------------
// Programación de alertas del navegador (15 min antes)
// ---------------------------------------------------------------------------

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function programarRecordatorios(eventos: EventoAgenda[]): void {
  // Limpiar timers anteriores
  timers.forEach((t) => clearTimeout(t));
  timers.clear();

  if (!tienePermiso()) return;

  const ahora = Date.now();
  for (const ev of eventos) {
    if (ev.completado) continue;
    const inicio    = new Date(ev.fecha).getTime();
    const alarma    = inicio - 15 * 60 * 1000; // 15 min antes
    if (alarma <= ahora) continue;

    const t = setTimeout(() => {
      new Notification(`Próxima cita: ${ev.titulo}`, {
        body: `En 15 minutos · ${new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(ev.fecha))}`,
        icon: '/favicon.ico',
        tag:  `mp-evento-${ev.id}`,
      });
    }, alarma - ahora);

    timers.set(ev.id, t);
  }
}

// ---------------------------------------------------------------------------
// Email recordatorio (1 hora antes) — se verifica al abrir la app
// ---------------------------------------------------------------------------

function getSentSet(): Set<string> {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function marcarEnviado(clave: string): void {
  const s = getSentSet();
  s.add(clave);
  // Purgar entradas antiguas (> 7 días)
  const umbral = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const limpias = [...s].filter((k) => {
    const partes = k.split(':');
    const fecha  = new Date(partes[partes.length - 1]);
    return !isNaN(fecha.getTime()) && fecha.getTime() > umbral;
  });
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(limpias));
}

/**
 * Revisa si hay eventos que empiezan en la próxima 1 hora y aún no recibieron
 * recordatorio por email hoy. Por cada uno llama a `onEnviar` (callback async).
 * `onEnviar` debe encargarse de enviar el email real vía gmailService.
 */
export async function verificarRecordatoriosEmail(
  eventos: EventoAgenda[],
  onEnviar: (ev: EventoAgenda) => Promise<void>
): Promise<void> {
  const ahora     = Date.now();
  const en1Hora   = ahora + 60 * 60 * 1000;
  const hoyStr    = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const enviados  = getSentSet();

  for (const ev of eventos) {
    if (ev.completado) continue;
    const inicio = new Date(ev.fecha).getTime();
    if (inicio < ahora || inicio > en1Hora) continue;

    const clave = `${ev.id}:${hoyStr}`;
    if (enviados.has(clave)) continue;

    try {
      await onEnviar(ev);
      marcarEnviado(clave);
    } catch {
      // No bloquear si falla un recordatorio
    }
  }
}
