import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Upload, Download } from 'lucide-react';
import { useAgendaStore, useUIStore } from '@/store';
import { sincronizarHaciaGoogle, importarDesdeGoogle } from '@/services/googleCalendarService';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { EventoForm } from './EventoForm';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const claveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Calendario mensual oscuro. Click en un día = nuevo evento;
 * click en chip = marcar hecho; arrastrar chip a otro día = mover evento.
 */
export function AgendaCalendar() {
  const eventos = useAgendaStore((s) => s.eventos);
  const agregar = useAgendaStore((s) => s.agregar);
  const actualizar = useAgendaStore((s) => s.actualizar);
  const alternarCompletado = useAgendaStore((s) => s.alternarCompletado);
  const notificar = useUIStore((s) => s.notificar);

  const googleConectado = useUIStore((s) => s.googleConectado);
  const [sincronizando, setSincronizando] = useState(false);

  const handleSync = async () => {
    setSincronizando(true);
    try {
      const res = await sincronizarHaciaGoogle(eventos);
      notificar(`${res.subidos} eventos subidos a Google Calendar`, 'exito');
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Error al sincronizar', 'error');
    } finally {
      setSincronizando(false);
    }
  };

  const handleImport = async () => {
    setSincronizando(true);
    try {
      const n = await importarDesdeGoogle();
      notificar(n > 0 ? `${n} eventos importados de Google Calendar` : 'No hay eventos nuevos en Google Calendar', 'info');
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Error al importar', 'error');
    } finally {
      setSincronizando(false);
    }
  };

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [diaSel, setDiaSel] = useState<Date | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [diaDrop, setDiaDrop] = useState<string | null>(null);

  const porDia = useMemo(() => {
    const m = new Map<string, typeof eventos>();
    for (const e of eventos) {
      const k = claveDia(new Date(e.fecha));
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return m;
  }, [eventos]);

  const celdas = useMemo(() => {
    const year = cursor.getFullYear();
    const mes = cursor.getMonth();
    const primero = new Date(year, mes, 1);
    const offset = (primero.getDay() + 6) % 7; // semana inicia lunes
    const diasEnMes = new Date(year, mes + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) out.push(null);
    for (let d = 1; d <= diasEnMes; d++) out.push(new Date(year, mes, d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [cursor]);

  const hoy = claveDia(new Date());
  const cambiarMes = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  // Mueve el evento arrastrado al día destino, conservando la hora.
  const soltar = (dia: Date) => {
    if (arrastrando) {
      const ev = eventos.find((e) => e.id === arrastrando);
      if (ev) {
        const orig = new Date(ev.fecha);
        const nueva = new Date(dia);
        nueva.setHours(orig.getHours(), orig.getMinutes(), 0, 0);
        if (nueva.getTime() !== orig.getTime()) {
          actualizar(ev.id, { fecha: nueva.toISOString() });
          notificar('Evento reprogramado', 'info');
        }
      }
    }
    setArrastrando(null);
    setDiaDrop(null);
  };

  return (
    <div className="calendario">
      <div className="calendario__nav">
        <Button variante="secundario" tamano="sm" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
          <ChevronLeft size={16} />
        </Button>
        <span className="calendario__mes">{MESES[cursor.getMonth()]} {cursor.getFullYear()}</span>
        <Button variante="secundario" tamano="sm" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
          <ChevronRight size={16} />
        </Button>
        <Button
          variante="secundario"
          tamano="sm"
          className="calendario__hoy"
          onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
        >
          Hoy
        </Button>

        {googleConectado && (
          <div className="calendario__sync">
            <Button
              variante="secundario"
              tamano="sm"
              disabled={sincronizando}
              title="Enviar eventos a Google Calendar"
              onClick={handleSync}
            >
              <Upload size={14} /> Sync →
            </Button>
            <Button
              variante="secundario"
              tamano="sm"
              disabled={sincronizando}
              title="Importar eventos de Google Calendar"
              onClick={handleImport}
            >
              <Download size={14} /> ← Import
            </Button>
          </div>
        )}
      </div>

      <div className="calendario__grid">
        {DIAS.map((d) => (
          <div key={d} className="calendario__cabecera">{d}</div>
        ))}

        {celdas.map((dia, i) => {
          if (!dia) return <div key={i} className="calendario__celda calendario__celda--vacia" />;
          const k = claveDia(dia);
          const delDia = porDia.get(k) ?? [];
          return (
            <div
              key={i}
              className={`calendario__celda ${k === hoy ? 'calendario__celda--hoy' : ''} ${diaDrop === k ? 'calendario__celda--drop' : ''}`}
              onClick={() => setDiaSel(dia)}
              onDragOver={(e) => { e.preventDefault(); if (diaDrop !== k) setDiaDrop(k); }}
              onDrop={() => soltar(dia)}
            >
              <span className="calendario__numero">{dia.getDate()}</span>
              <div className="calendario__eventos">
                {delDia.slice(0, 3).map((e) => (
                  <button
                    key={e.id}
                    className={`chip chip--${e.tipo} ${e.completado ? 'chip--hecho' : ''} ${arrastrando === e.id ? 'chip--drag' : ''}`}
                    title={e.completado ? 'Marcar pendiente' : 'Marcar hecho'}
                    draggable
                    onDragStart={(ev) => { ev.stopPropagation(); setArrastrando(e.id); }}
                    onDragEnd={() => { setArrastrando(null); setDiaDrop(null); }}
                    onClick={(ev) => { ev.stopPropagation(); alternarCompletado(e.id); }}
                  >
                    {e.titulo}
                  </button>
                ))}
                {delDia.length > 3 && <span className="calendario__mas">+{delDia.length - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal abierto={diaSel !== null} titulo="Nuevo evento" onCerrar={() => setDiaSel(null)}>
        {diaSel && (
          <EventoForm
            fechaInicial={diaSel.toISOString()}
            onCancelar={() => setDiaSel(null)}
            onGuardar={(data) => {
              agregar(data);
              setDiaSel(null);
              notificar('Evento agregado', 'exito');
            }}
          />
        )}
      </Modal>
    </div>
  );
}
