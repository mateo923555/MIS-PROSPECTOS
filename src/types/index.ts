/**
 * Tipos centrales de la aplicación "Mi Prospectos".
 * Un único punto de verdad para el dominio: Prospectos, Agenda, Llamadas y Notas.
 * Todo lo que persiste lleva `id` (uuid) y marcas de tiempo en ISO 8601.
 */

// ---------------------------------------------------------------------------
// Utilidades comunes
// ---------------------------------------------------------------------------

/** Identificador único (crypto.randomUUID). */
export type ID = string;

/** Fecha/hora en formato ISO 8601 (ej: "2026-05-31T14:30:00.000Z"). */
export type ISODate = string;

/** Campos que generamos automáticamente y el usuario nunca envía. */
export type Auditable = {
  id: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
};

/** A partir de una entidad auditable, el "input" que escribe el usuario. */
export type Input<T extends Auditable> = Omit<T, keyof Auditable>;

// ---------------------------------------------------------------------------
// Prospectos
// ---------------------------------------------------------------------------

/** Servicio contratado (para clientes cerrados). */
export type ServicioContratado =
  | 'web_simple'
  | 'web_avanzada'
  | 'ecommerce'
  | 'seo'
  | 'mantenimiento'
  | 'redes'
  | 'otro';

/** Etapa del prospecto dentro del embudo de ventas. */
export type EstadoProspecto =
  | 'nuevo'
  | 'contactado'
  | 'calificado'
  | 'propuesta'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

/** De dónde llegó el prospecto. */
export type OrigenProspecto =
  | 'referido'
  | 'web'
  | 'redes'
  | 'llamada_fria'
  | 'evento'
  | 'otro';

export interface Prospecto extends Auditable {
  nombre: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  /** Dirección de la clínica/negocio (p. ej. de Google Maps). */
  direccion?: string;
  ciudad?: string;
  /** Calificación de Google (0–5). */
  rating?: number;
  /** Cantidad de reseñas. */
  reviews?: number;
  estado: EstadoProspecto;
  origen: OrigenProspecto;
  /** Valor estimado del negocio / costo, en la moneda local. */
  valorEstimado: number;
  /** Fecha del último contacto registrado (se actualiza con llamadas/eventos). */
  ultimoContacto?: ISODate;
  /** Fecha de cierre (cuando pasa a ganado/perdido). */
  fechaCierre?: ISODate;
  /** Servicio contratado (cuando el prospecto pasa a ganado). */
  servicio?: ServicioContratado;
  notas?: string;
}

export type ProspectoInput = Input<Prospecto>;

// ---------------------------------------------------------------------------
// Llamadas
// ---------------------------------------------------------------------------

/** Desenlace de una llamada. */
export type ResultadoLlamada =
  | 'contestada'
  | 'no_contesto'
  | 'buzon'
  | 'reagendar'
  | 'interesado'
  | 'no_interesado';

export interface Llamada extends Auditable {
  prospectoId: ID;
  /** Momento en que ocurrió la llamada. */
  fecha: ISODate;
  /** Duración en minutos. */
  duracion: number;
  resultado: ResultadoLlamada;
  notas?: string;
}

export type LlamadaInput = Input<Llamada>;

// ---------------------------------------------------------------------------
// Agenda (eventos / citas)
// ---------------------------------------------------------------------------

export type TipoEvento = 'llamada' | 'reunion' | 'seguimiento' | 'email' | 'otro';

export interface EventoAgenda extends Auditable {
  titulo: string;
  /** Prospecto asociado (opcional: pueden existir eventos sueltos). */
  prospectoId?: ID;
  /** Fecha y hora del evento. */
  fecha: ISODate;
  tipo: TipoEvento;
  descripcion?: string;
  completado: boolean;
  /** ID del evento en Google Calendar, si fue sincronizado. */
  googleCalendarId?: string;
}

export type EventoAgendaInput = Input<EventoAgenda>;

// ---------------------------------------------------------------------------
// Notas
// ---------------------------------------------------------------------------

export interface Nota extends Auditable {
  contenido: string;
  /** Prospecto asociado (opcional). */
  prospectoId?: ID;
  /** Nota fijada al inicio de la lista. */
  fijada: boolean;
  etiquetas: string[];
}

export type NotaInput = Input<Nota>;

// ---------------------------------------------------------------------------
// Dashboard (datos derivados, no se persisten)
// ---------------------------------------------------------------------------

export interface MetricasDashboard {
  totalProspectos: number;
  prospectosActivos: number;
  ganados: number;
  perdidos: number;
  /** Suma del valorEstimado de los prospectos no cerrados. */
  valorEnEmbudo: number;
  /** Tasa de conversión (ganados / cerrados) en porcentaje 0–100. */
  tasaConversion: number;
  /** Conteo de prospectos por estado, para gráficos. */
  porEstado: Record<EstadoProspecto, number>;
  llamadasHoy: number;
  eventosPendientes: number;
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

export type Tema = 'claro' | 'oscuro';

/** Notificación efímera (toast). */
export interface Toast {
  id: ID;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info';
}

// ---------------------------------------------------------------------------
// Landings
// ---------------------------------------------------------------------------

export type CategoriaLanding =
  | 'electricista'
  | 'barbershop'
  | 'abogado'
  | 'dentista'
  | 'salon'
  | 'restaurante'
  | 'otro';

export type EstadoLanding = 'desarrollo' | 'deployada' | 'vendida' | 'archivada';

export interface Landing extends Auditable {
  nombre: string;
  descripcion?: string;
  /** URL pública deployada. */
  url: string;
  urlRepo?: string;
  cliente?: string;
  categoria: CategoriaLanding;
  estado: EstadoLanding;
  tecnologia: string[];
  notas?: string;
  fechaCreacion: ISODate;
}

export type LandingInput = Input<Landing>;
