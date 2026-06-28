import { useMemo, useState } from 'react';
import { Plus, Trash2, Users, Mail, Loader } from 'lucide-react';
import { useProspectosStore, useUIStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { ProspectoForm } from './ProspectoForm';
import { formatMoneda, formatFecha } from '@/lib/format';
import { ORDEN_ESTADOS, ESTADOS } from '@/lib/constants';
import type { EstadoProspecto, Prospecto } from '@/types';
import { obtenerThreadsDeProspecto, type EmailThreadResumen } from '@/services/gmailService';

/** Tabla de prospectos con búsqueda, filtro, alta, cambio de estado, borrado e historial Gmail. */
export function ProspectosList() {
  const prospectos     = useProspectosStore((s) => s.prospectos);
  const agregar        = useProspectosStore((s) => s.agregar);
  const cambiarEstado  = useProspectosStore((s) => s.cambiarEstado);
  const eliminar       = useProspectosStore((s) => s.eliminar);
  const notificar      = useUIStore((s) => s.notificar);
  const busqueda       = useUIStore((s) => s.busqueda);
  const setBusqueda    = useUIStore((s) => s.setBusqueda);
  const googleConectado = useUIStore((s) => s.googleConectado);

  const [filtro, setFiltro]           = useState<EstadoProspecto | 'todos'>('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [gmailProspecto, setGmailProspecto] = useState<Prospecto | null>(null);
  const [threads, setThreads]         = useState<EmailThreadResumen[]>([]);
  const [cargandoThreads, setCargandoThreads] = useState(false);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return prospectos.filter((p) => {
      const coincideTexto =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        (p.empresa ?? '').toLowerCase().includes(q);
      const coincideFiltro = filtro === 'todos' || p.estado === filtro;
      return coincideTexto && coincideFiltro;
    });
  }, [prospectos, busqueda, filtro]);

  const abrirGmail = async (p: Prospecto) => {
    if (!p.email) {
      notificar(`${p.nombre} no tiene email registrado`, 'error');
      return;
    }
    setGmailProspecto(p);
    setThreads([]);
    setCargandoThreads(true);
    try {
      const data = await obtenerThreadsDeProspecto(p.email);
      setThreads(data);
      if (data.length === 0) notificar('No se encontraron emails en Gmail', 'info');
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Error al leer Gmail', 'error');
      setGmailProspecto(null);
    } finally {
      setCargandoThreads(false);
    }
  };

  return (
    <div className="prospectos">
      <div className="prospectos__barra">
        <input
          className="input-busqueda"
          placeholder="Buscar por nombre o empresa…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtro} onChange={(e) => setFiltro(e.target.value as EstadoProspecto | 'todos')}>
          <option value="todos">Todos los estados</option>
          {ORDEN_ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADOS[e].label}</option>
          ))}
        </select>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus size={16} /> Nuevo
        </Button>
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          icono={<Users size={32} />}
          titulo="Sin prospectos"
          descripcion="Crea tu primer prospecto para empezar."
          accion={<Button onClick={() => setModalAbierto(true)}><Plus size={16} /> Nuevo prospecto</Button>}
        />
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Valor</th>
                <th>Último contacto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="tabla__nombre">{p.nombre}</div>
                    {p.email && <div className="tabla__sub">{p.email}</div>}
                  </td>
                  <td>{p.empresa || '—'}</td>
                  <td>
                    <select
                      className="select-estado"
                      value={p.estado}
                      onChange={(e) => cambiarEstado(p.id, e.target.value as EstadoProspecto)}
                    >
                      {ORDEN_ESTADOS.map((e) => (
                        <option key={e} value={e}>{ESTADOS[e].label}</option>
                      ))}
                    </select>
                  </td>
                  <td>{formatMoneda(p.valorEstimado)}</td>
                  <td>{p.ultimoContacto ? formatFecha(p.ultimoContacto) : '—'}</td>
                  <td>
                    <div className="tabla__acciones">
                      {googleConectado && p.email && (
                        <button
                          className="tabla__accion"
                          title={`Historial Gmail — ${p.email}`}
                          aria-label={`Ver historial Gmail de ${p.nombre}`}
                          onClick={() => abrirGmail(p)}
                        >
                          <Mail size={15} />
                        </button>
                      )}
                      <button
                        className="tabla__borrar"
                        title="Eliminar"
                        aria-label={`Eliminar ${p.nombre}`}
                        onClick={() => {
                          eliminar(p.id);
                          notificar('Prospecto eliminado', 'info');
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Nuevo prospecto */}
      <Modal abierto={modalAbierto} titulo="Nuevo prospecto" onCerrar={() => setModalAbierto(false)}>
        <ProspectoForm
          onCancelar={() => setModalAbierto(false)}
          onGuardar={(data) => {
            agregar(data);
            setModalAbierto(false);
            notificar('Prospecto creado', 'exito');
          }}
        />
      </Modal>

      {/* Modal: Historial Gmail */}
      <Modal
        abierto={gmailProspecto !== null}
        titulo={gmailProspecto ? `Gmail — ${gmailProspecto.nombre}` : ''}
        onCerrar={() => { setGmailProspecto(null); setThreads([]); }}
      >
        {cargandoThreads ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 0', color: 'var(--muted)' }}>
            <Loader size={18} className="spin" /> Cargando hilos de Gmail…
          </div>
        ) : threads.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No se encontraron emails.</p>
        ) : (
          <div className="thread-list">
            {threads.map((t) => (
              <div key={t.id} className="thread-item">
                <div className="thread-item__asunto">{t.asunto}</div>
                <div className="thread-item__meta">
                  <span>{t.de}</span>
                  <span>{t.fecha ? new Date(t.fecha).toLocaleDateString('es-AR') : ''}</span>
                </div>
                <div className="thread-item__snippet">{t.snippet}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
