import {
  useProspectosStore,
  useAgendaStore,
  useLlamadasStore,
  useNotasStore,
} from '@/store';
import { ORDEN_ESTADOS } from '@/lib/constants';
import type {
  Prospecto,
  EstadoProspecto,
  OrigenProspecto,
  TipoEvento,
  ResultadoLlamada,
  ServicioContratado,
} from '@/types';

// Datos base para generar prospectos verosímiles (odontólogos del Partido de
// General San Martín, Buenos Aires). Origen típico: scraping de Google Maps.
const NOMBRES = [
  'Carlos', 'María', 'Jorge', 'Lucía', 'Roberto', 'Sofía', 'Diego', 'Valentina',
  'Andrés', 'Paula', 'Gabriel', 'Florencia', 'Hernán', 'Camila', 'Marcelo',
  'Agustina', 'Pablo', 'Rocío', 'Sebastián', 'Daniela', 'Fernando', 'Carolina',
  'Nicolás', 'Julieta', 'Matías', 'Victoria', 'Leandro', 'Mariana', 'Tomás', 'Belén',
];
const APELLIDOS = [
  'Gómez', 'Fernández', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Sánchez',
  'Romero', 'Díaz', 'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta',
  'Benítez', 'Medina', 'Suárez', 'Herrera', 'Aguirre', 'Giménez', 'Molina',
  'Castro', 'Ortiz', 'Núñez', 'Rojas', 'Vega', 'Cabrera', 'Ríos', 'Sosa',
];
const CIUDADES = ['San Martín', 'Villa Ballester', 'José León Suárez'];
const CALLES = [
  'Av. San Martín', 'Belgrano', 'Mitre', 'Sarmiento', 'Rivadavia', '9 de Julio',
  'Pueyrredón', 'Matheu', 'Av. 25 de Mayo', 'Alvear', 'Perdriel', 'Lavalle',
];

const SERVICIOS_SEED: ServicioContratado[] = [
  'web_simple', 'web_avanzada', 'ecommerce', 'seo', 'mantenimiento', 'redes',
];

const dias = (n: number) => new Date(Date.now() + n * 86400000).toISOString();
const horas = (n: number) => new Date(Date.now() + n * 3600000).toISOString();
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length];

/** Genera y persiste 30 odontólogos de ejemplo. Devuelve los creados. */
export function seedProspectos(): Prospecto[] {
  const store = useProspectosStore.getState();
  const creados: Prospecto[] = [];

  for (let i = 0; i < 30; i++) {
    const nombre = pick(NOMBRES, i);
    const apellido = pick(APELLIDOS, i * 7 + 3);
    const trato = i % 2 === 0 ? 'Dr.' : 'Dra.';
    const ciudad = pick(CIUDADES, i);
    // Reparte los estados a lo largo del embudo de forma estable.
    const estado: EstadoProspecto = pick(ORDEN_ESTADOS, i * 3);
    const cerrado = estado === 'ganado' || estado === 'perdido';

    const p = store.agregar({
      nombre: `${trato} ${nombre} ${apellido}`,
      empresa: `Consultorio Odontológico ${apellido}`,
      email: `${nombre}.${apellido}@gmail.com`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, ''),
      telefono: `+54 11 4${rnd(100, 899)}-${rnd(1000, 9999)}`,
      direccion: `${pick(CALLES, i * 2)} ${rnd(100, 4500)}`,
      ciudad,
      rating: Number((Math.random() * 1.4 + 3.6).toFixed(1)), // 3.6–5.0
      reviews: rnd(4, 340),
      estado,
      origen: 'web' as OrigenProspecto,
      valorEstimado: rnd(5, 36) * 5000, // 25.000–180.000
      ...(cerrado ? { fechaCierre: dias(-rnd(1, 40)) } : {}),
      ...(estado === 'ganado' ? { servicio: pick(SERVICIOS_SEED, i * 5 + 2) } : {}),
      ...(estado !== 'nuevo' ? { ultimoContacto: dias(-rnd(1, 25)) } : {}),
    });
    creados.push(p);
  }
  return creados;
}

const TITULOS_EVENTO = [
  'Llamada de seguimiento', 'Visita al consultorio', 'Enviar presupuesto',
  'Demo del servicio', 'Reunión de cierre', 'Recordatorio de propuesta',
];
const TIPOS: TipoEvento[] = ['llamada', 'reunion', 'seguimiento', 'email'];

/** Genera 15 eventos próximos, vinculados a prospectos si los hay. */
export function seedAgenda(prospectos = useProspectosStore.getState().prospectos) {
  const agenda = useAgendaStore.getState();
  for (let i = 0; i < 15; i++) {
    const p = prospectos[i % Math.max(prospectos.length, 1)];
    agenda.agregar({
      titulo: pick(TITULOS_EVENTO, i),
      fecha: dias(rnd(0, 14)),
      tipo: pick(TIPOS, i),
      completado: false,
      ...(p ? { prospectoId: p.id } : {}),
    });
  }
}

const RESULTADOS: ResultadoLlamada[] = [
  'contestada', 'no_contesto', 'buzon', 'reagendar', 'interesado', 'no_interesado',
];

/** Genera 20 registros de llamadas sobre los prospectos dados. */
export function seedLlamadas(prospectos = useProspectosStore.getState().prospectos) {
  if (prospectos.length === 0) return;
  const llamadas = useLlamadasStore.getState();
  for (let i = 0; i < 20; i++) {
    const p = prospectos[i % prospectos.length];
    llamadas.agregar({
      prospectoId: p.id,
      fecha: horas(-rnd(0, 240)),
      duracion: rnd(1, 18),
      resultado: pick(RESULTADOS, i),
    });
  }
}

const NOTAS_BASE = [
  'Pidió presupuesto por WhatsApp.',
  'Interesado en plan anual, evaluar descuento.',
  'Atiende solo por las tardes.',
  'Ya trabaja con otro proveedor, reintentar en 2 meses.',
  'Recepcionista muy amable, dejar material impreso.',
  'Quiere ver casos de éxito antes de decidir.',
];

/** Genera una nota por cada uno de los primeros prospectos. */
export function seedNotas(prospectos = useProspectosStore.getState().prospectos) {
  const notas = useNotasStore.getState();
  prospectos.slice(0, NOTAS_BASE.length * 2).forEach((p, i) => {
    notas.agregar({
      contenido: `${p.nombre}: ${pick(NOTAS_BASE, i)}`,
      prospectoId: p.id,
      fijada: i < 2,
      etiquetas: [p.ciudad ?? 'general'],
    });
  });
}

/** Siembra todo el dataset de ejemplo de forma coherente. */
export function sembrarTodo() {
  const prospectos = seedProspectos();
  seedAgenda(prospectos);
  seedLlamadas(prospectos);
  seedNotas(prospectos);
}

/** Borra TODOS los datos (reseteo de la app). */
export function limpiarTodo() {
  useProspectosStore.setState({ prospectos: [] });
  useAgendaStore.setState({ eventos: [] });
  useLlamadasStore.setState({ llamadas: [] });
  useNotasStore.setState({ notas: [] });
}
