import type {
  EstadoProspecto,
  OrigenProspecto,
  ResultadoLlamada,
  TipoEvento,
  ServicioContratado,
} from '@/types';

/** Etiquetas legibles + clase de color para cada estado del embudo. */
export const ESTADOS: Record<EstadoProspecto, { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: 'gris' },
  contactado: { label: 'Contactado', color: 'azul' },
  calificado: { label: 'Calificado', color: 'cian' },
  propuesta: { label: 'Propuesta', color: 'morado' },
  negociacion: { label: 'Negociación', color: 'naranja' },
  ganado: { label: 'Ganado', color: 'verde' },
  perdido: { label: 'Perdido', color: 'rojo' },
};

/** Hex por nombre de color semántico (paleta neón; para Kanban, gráficos, etc.). */
export const COLOR_HEX: Record<string, string> = {
  gris: '#64748b',
  azul: '#00d4ff',
  cian: '#00ff88',
  morado: '#a855f7',
  naranja: '#ff6b35',
  verde: '#00ff88',
  rojo: '#ff3b6b',
};

/** Orden del embudo (para selects y métricas). */
export const ORDEN_ESTADOS: EstadoProspecto[] = [
  'nuevo',
  'contactado',
  'calificado',
  'propuesta',
  'negociacion',
  'ganado',
  'perdido',
];

export const ORIGENES: Record<OrigenProspecto, string> = {
  referido: 'Referido',
  web: 'Sitio web',
  redes: 'Redes sociales',
  llamada_fria: 'Llamada fría',
  evento: 'Evento',
  otro: 'Otro',
};

export const RESULTADOS: Record<ResultadoLlamada, string> = {
  contestada: 'Contestada',
  no_contesto: 'No contestó',
  buzon: 'Buzón',
  reagendar: 'Reagendar',
  interesado: 'Interesado',
  no_interesado: 'No interesado',
};

export const SERVICIOS: Record<ServicioContratado, string> = {
  web_simple: 'Web Simple',
  web_avanzada: 'Web Avanzada',
  ecommerce: 'E-commerce',
  seo: 'SEO / Posicionamiento',
  mantenimiento: 'Mantenimiento',
  redes: 'Redes Sociales',
  otro: 'Otro',
};

export const TIPOS_EVENTO: Record<TipoEvento, string> = {
  llamada: 'Llamada',
  reunion: 'Reunión',
  seguimiento: 'Seguimiento',
  email: 'Email',
  otro: 'Otro',
};
