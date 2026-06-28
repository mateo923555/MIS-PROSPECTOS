import JSZip from 'jszip';
import {
  useProspectosStore,
  useAgendaStore,
  useLlamadasStore,
} from '@/store';
import { ORDEN_ESTADOS, ORIGENES, TIPOS_EVENTO } from '@/lib/constants';
import type {
  Prospecto,
  ProspectoInput,
  EventoAgendaInput,
  EstadoProspecto,
  OrigenProspecto,
  TipoEvento,
} from '@/types';

// ---------------------------------------------------------------------------
// Utilidades CSV
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tick = () => new Promise((r) => setTimeout(r, 0));
const normTel = (t = '') => t.replace(/\D/g, '');

/** Serializa filas a CSV (RFC 4180: comillas y comas escapadas). */
function aCSV(headers: string[], filas: string[][]): string {
  const esc = (v: string) => {
    const s = v ?? '';
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...filas].map((f) => f.map(esc).join(',')).join('\r\n');
}

/** Parser CSV que respeta campos entre comillas (con comas y saltos de línea). */
function parseCSV(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let enComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
    else if (c !== '\r') campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  // Descarta filas totalmente vacías.
  return filas.filter((f) => f.some((c) => c.trim() !== ''));
}

/** Dispara la descarga de un Blob/texto en el navegador. */
function descargar(contenido: BlobPart, nombre: string, tipo = 'text/csv;charset=utf-8') {
  const blob = contenido instanceof Blob ? contenido : new Blob(['﻿', contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

const fechaArchivo = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Esquema de columnas (Prospectos)
// ---------------------------------------------------------------------------

const HEADERS_PROSPECTO = [
  'nombre', 'empresa', 'email', 'telefono', 'direccion', 'ciudad',
  'rating', 'reviews', 'estado', 'origen', 'costo',
  'ultimoContacto', 'fechaCierre', 'notas',
];

function prospectoAFila(p: Prospecto): string[] {
  return [
    p.nombre,
    p.empresa ?? '',
    p.email ?? '',
    p.telefono ?? '',
    p.direccion ?? '',
    p.ciudad ?? '',
    p.rating != null ? String(p.rating) : '',
    p.reviews != null ? String(p.reviews) : '',
    p.estado,
    p.origen,
    String(p.valorEstimado ?? 0),
    p.ultimoContacto ?? '',
    p.fechaCierre ?? '',
    p.notas ?? '',
  ];
}

function csvProspectos(): string {
  const { prospectos } = useProspectosStore.getState();
  return aCSV(HEADERS_PROSPECTO, prospectos.map(prospectoAFila));
}

// ---------------------------------------------------------------------------
// Esquema de columnas (Agenda y Llamadas)
// ---------------------------------------------------------------------------

const HEADERS_AGENDA = ['titulo', 'fecha', 'tipo', 'completado', 'prospecto'];
const HEADERS_LLAMADAS = ['prospecto', 'fecha', 'duracion', 'resultado', 'notas'];

function csvAgenda(): string {
  const eventos = useAgendaStore.getState().eventos;
  const nombre = mapaNombres();
  const filas = eventos.map((e) => [
    e.titulo,
    e.fecha,
    e.tipo,
    e.completado ? 'sí' : 'no',
    e.prospectoId ? nombre.get(e.prospectoId) ?? '' : '',
  ]);
  return aCSV(HEADERS_AGENDA, filas);
}

function csvLlamadas(): string {
  const llamadas = useLlamadasStore.getState().llamadas;
  const nombre = mapaNombres();
  const filas = llamadas.map((l) => [
    nombre.get(l.prospectoId) ?? '',
    l.fecha,
    String(l.duracion),
    l.resultado,
    l.notas ?? '',
  ]);
  return aCSV(HEADERS_LLAMADAS, filas);
}

const mapaNombres = () =>
  new Map(useProspectosStore.getState().prospectos.map((p) => [p.id, p.nombre]));

// ---------------------------------------------------------------------------
// EXPORT
// ---------------------------------------------------------------------------

export function exportarProspectos() {
  descargar(csvProspectos(), `prospectos-${fechaArchivo()}.csv`);
}

export function exportarAgenda() {
  descargar(csvAgenda(), `agenda-${fechaArchivo()}.csv`);
}

export function exportarLlamadas() {
  descargar(csvLlamadas(), `llamadas-${fechaArchivo()}.csv`);
}

/** Exporta los tres CSV juntos en un .zip. */
export async function exportarTodo() {
  const zip = new JSZip();
  zip.file('prospectos.csv', '﻿' + csvProspectos());
  zip.file('agenda.csv', '﻿' + csvAgenda());
  zip.file('llamadas.csv', '﻿' + csvLlamadas());
  const blob = await zip.generateAsync({ type: 'blob' });
  descargar(blob, `mi-prospectos-${fechaArchivo()}.zip`, 'application/zip');
}

// ---------------------------------------------------------------------------
// IMPORT
// ---------------------------------------------------------------------------

export interface ResultadoImport {
  importados: number;
  duplicados: number;
  invalidos: number;
  errores: string[];
}

const estadoValido = (v: string): EstadoProspecto =>
  (ORDEN_ESTADOS as string[]).includes(v) ? (v as EstadoProspecto) : 'nuevo';

const origenValido = (v: string): OrigenProspecto =>
  Object.keys(ORIGENES).includes(v) ? (v as OrigenProspecto) : 'otro';

const tipoValido = (v: string): TipoEvento =>
  Object.keys(TIPOS_EVENTO).includes(v) ? (v as TipoEvento) : 'otro';

const numOpt = (v: string): number | undefined => {
  if (!v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const isoOpt = (v: string): string | undefined => {
  if (!v.trim()) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

/**
 * Importa prospectos desde un CSV. Valida headers, emails y deduplica por
 * teléfono (contra los existentes y dentro del propio archivo).
 * `onProgress` recibe un porcentaje 0–100.
 */
export async function importarProspectos(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ResultadoImport> {
  const filas = parseCSV(await file.text());
  if (filas.length < 2) throw new Error('El CSV no tiene filas de datos.');

  const headers = filas[0].map((h) => h.trim().toLowerCase());
  if (!headers.includes('nombre')) {
    throw new Error('Falta la columna obligatoria "nombre".');
  }
  const col = (h: string) => headers.indexOf(h.toLowerCase());

  const store = useProspectosStore.getState();
  const telefonos = new Set(
    store.prospectos.map((p) => normTel(p.telefono)).filter(Boolean)
  );

  const res: ResultadoImport = { importados: 0, duplicados: 0, invalidos: 0, errores: [] };
  const total = filas.length - 1;

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    const val = (h: string) => {
      const j = col(h);
      return j >= 0 ? (fila[j] ?? '').trim() : '';
    };

    const nombre = val('nombre');
    if (!nombre) { res.invalidos++; res.errores.push(`Fila ${i + 1}: sin nombre.`); continue; }

    const email = val('email');
    if (email && !EMAIL_RE.test(email)) {
      res.invalidos++; res.errores.push(`Fila ${i + 1}: email inválido (${email}).`); continue;
    }

    const tel = val('telefono');
    const telN = normTel(tel);
    if (telN && telefonos.has(telN)) { res.duplicados++; continue; }
    if (telN) telefonos.add(telN);

    const input: ProspectoInput = {
      nombre,
      empresa: val('empresa') || undefined,
      email: email || undefined,
      telefono: tel || undefined,
      direccion: val('direccion') || undefined,
      ciudad: val('ciudad') || undefined,
      rating: numOpt(val('rating')),
      reviews: numOpt(val('reviews')),
      estado: estadoValido(val('estado')),
      origen: origenValido(val('origen')),
      valorEstimado: numOpt(val('costo')) ?? 0,
      ultimoContacto: isoOpt(val('ultimoContacto')),
      fechaCierre: isoOpt(val('fechaCierre')),
      notas: val('notas') || undefined,
    };
    store.agregar(input);
    res.importados++;

    if (onProgress && (i % 5 === 0 || i === filas.length - 1)) {
      onProgress(Math.round((i / total) * 100));
      await tick(); // cede el hilo para que la barra de progreso se pinte
    }
  }

  onProgress?.(100);
  return res;
}

/**
 * Importa eventos de agenda desde un CSV. Requiere `titulo` y `fecha`.
 * Vincula al prospecto por nombre si coincide.
 */
export async function importarAgenda(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ResultadoImport> {
  const filas = parseCSV(await file.text());
  if (filas.length < 2) throw new Error('El CSV no tiene filas de datos.');

  const headers = filas[0].map((h) => h.trim().toLowerCase());
  if (!headers.includes('titulo') || !headers.includes('fecha')) {
    throw new Error('Faltan columnas obligatorias: "titulo" y "fecha".');
  }
  const col = (h: string) => headers.indexOf(h.toLowerCase());

  const agenda = useAgendaStore.getState();
  const idPorNombre = new Map(
    useProspectosStore.getState().prospectos.map((p) => [p.nombre.toLowerCase(), p.id])
  );

  const res: ResultadoImport = { importados: 0, duplicados: 0, invalidos: 0, errores: [] };
  const total = filas.length - 1;

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    const val = (h: string) => {
      const j = col(h);
      return j >= 0 ? (fila[j] ?? '').trim() : '';
    };

    const titulo = val('titulo');
    const fecha = isoOpt(val('fecha'));
    if (!titulo) { res.invalidos++; res.errores.push(`Fila ${i + 1}: sin título.`); continue; }
    if (!fecha) { res.invalidos++; res.errores.push(`Fila ${i + 1}: fecha inválida.`); continue; }

    const prospectoId = idPorNombre.get(val('prospecto').toLowerCase());
    const completado = /^(s[ií]|true|1|yes)$/i.test(val('completado'));

    const input: EventoAgendaInput = {
      titulo,
      fecha,
      tipo: tipoValido(val('tipo')),
      completado,
      ...(prospectoId ? { prospectoId } : {}),
    };
    agenda.agregar(input);
    res.importados++;

    if (onProgress && (i % 5 === 0 || i === filas.length - 1)) {
      onProgress(Math.round((i / total) * 100));
      await tick();
    }
  }

  onProgress?.(100);
  return res;
}
