/**
 * Autenticación OAuth 2.0 con Google Identity Services (GIS).
 * Token client con popup — no requiere backend.
 * Prerequisito: VITE_GOOGLE_CLIENT_ID en .env
 */

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ');

const TOKEN_KEY  = 'mp:g_token';
const EXPIRY_KEY = 'mp:g_expiry';
const EMAIL_KEY  = 'mp:g_email';

let _client: GoogleTokenClient | null = null;
let _pending: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

// ---------------------------------------------------------------------------
// Script loader
// ---------------------------------------------------------------------------

let _gisLoaded = false;
async function cargarGIS(): Promise<void> {
  if (_gisLoaded || window.google?.accounts?.oauth2) { _gisLoaded = true; return; }
  return new Promise<void>((res, rej) => {
    const existing = document.getElementById('gis-script');
    if (existing) { existing.addEventListener('load', () => res()); return; }
    const s = document.createElement('script');
    s.id   = 'gis-script';
    s.src  = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload  = () => { _gisLoaded = true; res(); };
    s.onerror = () => rej(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(s);
  });
}

// ---------------------------------------------------------------------------
// Token client (singleton por sesión)
// ---------------------------------------------------------------------------

function iniciarCliente(): void {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '') as string;
  if (!clientId) throw new Error('Configurá VITE_GOOGLE_CLIENT_ID en el archivo .env antes de conectar Google.');

  _client = window.google!.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (resp) => {
      if (!_pending) return;
      if (resp.error || !resp.access_token) {
        _pending.reject(new Error(resp.error_description ?? resp.error ?? 'Error de autenticación con Google'));
      } else {
        const expiry = Date.now() + (resp.expires_in ?? 3600) * 1000;
        localStorage.setItem(TOKEN_KEY,  resp.access_token);
        localStorage.setItem(EXPIRY_KEY, String(expiry));
        _pending.resolve(resp.access_token);
      }
      _pending = null;
    },
  });
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/** Devuelve el token si existe y no expiró (1 min de buffer). */
export function getTokenCacheado(): string | null {
  const t   = localStorage.getItem(TOKEN_KEY);
  const exp = Number(localStorage.getItem(EXPIRY_KEY) ?? 0);
  if (!t || Date.now() >= exp - 60_000) return null;
  return t;
}

/** true si hay token válido en caché. */
export function estaConectado(): boolean {
  return getTokenCacheado() !== null;
}

/** Email del usuario de Google (guardado tras conectar). */
export function getEmailGuardado(): string {
  return localStorage.getItem(EMAIL_KEY) ?? '';
}

/**
 * Abre el popup de Google para autenticar.
 * Debe llamarse desde un evento de usuario (click) para evitar bloqueo de popup.
 */
export async function conectarGoogle(): Promise<string> {
  await cargarGIS();
  if (!_client) iniciarCliente();
  return new Promise((resolve, reject) => {
    _pending = { resolve, reject };
    _client!.requestAccessToken();
  });
}

/** Devuelve token cacheado o dispara el flujo OAuth. */
export async function obtenerToken(): Promise<string> {
  const cached = getTokenCacheado();
  if (cached) return cached;
  return conectarGoogle();
}

/** Obtiene el email del usuario autenticado y lo guarda en localStorage. */
export async function cargarEmailUsuario(): Promise<string> {
  const token = getTokenCacheado();
  if (!token) return '';
  try {
    const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return '';
    const data = await resp.json() as { email?: string };
    const email = data.email ?? '';
    if (email) localStorage.setItem(EMAIL_KEY, email);
    return email;
  } catch {
    return '';
  }
}

/** Revoca el token y limpia el estado local. */
export function desconectarGoogle(): void {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) window.google?.accounts?.oauth2?.revoke(t, () => {});
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(EMAIL_KEY);
  _client  = null;
  _pending = null;
}
