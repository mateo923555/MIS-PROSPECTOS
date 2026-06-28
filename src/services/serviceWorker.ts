/**
 * Registro del Service Worker para PWA y notificaciones push.
 */

export async function registrarServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[SW] Registrado:', registration.scope);

    if ('Notification' in window && Notification.permission === 'default') {
      // No pedimos permiso aquí — lo hace notificacionesService cuando el usuario lo activa
    }
  } catch (err) {
    console.error('[SW] Error al registrar:', err);
  }
}

/**
 * Envía un mensaje al Service Worker activo para mostrar una notificación push.
 */
export async function enviarNotificacionPush(
  titulo: string,
  opciones?: NotificationOptions
): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: 'SHOW_NOTIFICATION', titulo, opciones });
}
