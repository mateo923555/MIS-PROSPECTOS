import { useEffect, useRef, useState } from 'react';
import {
  Download, Upload, Database, Trash2, FileArchive,
  Unplug, PlugZap, Bell, BellOff,
} from 'lucide-react';
import { useUIStore } from '@/store';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import {
  exportarProspectos, exportarAgenda, exportarLlamadas, exportarTodo,
  importarProspectos, importarAgenda, type ResultadoImport,
} from '@/services/exportService';
import { sembrarTodo, limpiarTodo } from '@/services/seedService';
import {
  conectarGoogle, desconectarGoogle,
  estaConectado, getEmailGuardado, cargarEmailUsuario,
} from '@/services/googleAuthService';
import { pedirPermiso, tienePermiso, programarRecordatorios } from '@/services/notificacionesService';
import { useAgendaStore, useLandingsStore } from '@/store';
import { exportarLandingsJSON, importarLandingsJSON } from '@/services/landingsExportService';


function LandingsBackup() {
  const landings = useLandingsStore((s) => s.landings);
  const agregar  = useLandingsStore((s) => s.agregar);
  const refJson  = { current: null as HTMLInputElement | null };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importarLandingsJSON(file, (imported) => {
      imported.forEach((l) =>
        agregar({
          nombre: l.nombre,
          url: l.url,
          categoria: l.categoria,
          estado: l.estado,
          tecnologia: l.tecnologia,
          descripcion: l.descripcion,
          urlRepo: l.urlRepo,
          cliente: l.cliente,
          notas: l.notas,
          fechaCreacion: l.fechaCreacion,
        })
      );
      alert(`${imported.length} landings importadas correctamente.`);
    });
    e.target.value = '';
  };

  return (
    <div className="ajustes__grupo">
      <Button variante="secundario" onClick={() => exportarLandingsJSON(landings)}>
        <Download size={16} /> Exportar landings ({landings.length})
      </Button>
      <input type="file" accept=".json" hidden ref={refJson} onChange={handleImport} />
      <Button variante="secundario" onClick={() => refJson.current?.click()}>
        <Upload size={16} /> Importar landings (JSON)
      </Button>
    </div>
  );
}

export function SettingsPage() {
  const notificar          = useUIStore((s) => s.notificar);
  const googleConectado    = useUIStore((s) => s.googleConectado);
  const setGoogleConectado = useUIStore((s) => s.setGoogleConectado);
  const notificacionesOk   = useUIStore((s) => s.notificacionesOk);
  const setNotificacionesOk = useUIStore((s) => s.setNotificacionesOk);
  const eventos            = useAgendaStore((s) => s.eventos);

  const [emailGoogle, setEmailGoogle]     = useState(getEmailGuardado);
  const [importando, setImportando]       = useState(false);
  const [progreso, setProgreso]           = useState(0);
  const [resultado, setResultado]         = useState<ResultadoImport | null>(null);
  const [confirmLimpiar, setConfirmLimpiar] = useState(false);
  const [conectando, setConectando]       = useState(false);

  const refProspectos = useRef<HTMLInputElement>(null);
  const refAgenda     = useRef<HTMLInputElement>(null);

  // Sincronizar estado con localStorage al montar
  useEffect(() => {
    if (estaConectado()) {
      setGoogleConectado(true);
      cargarEmailUsuario().then((e) => { if (e) setEmailGoogle(e); });
    } else {
      setGoogleConectado(false);
    }
    if (tienePermiso()) setNotificacionesOk(true);
  }, [setGoogleConectado, setNotificacionesOk]);

  const manejarImport = async (
    file: File,
    fn: (f: File, cb: (p: number) => void) => Promise<ResultadoImport>,
    label: string
  ) => {
    setImportando(true);
    setProgreso(0);
    setResultado(null);
    try {
      const res = await fn(file, setProgreso);
      setResultado(res);
      notificar(`${res.importados} ${label} importados correctamente`, 'exito');
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Error al importar el CSV', 'error');
    } finally {
      setImportando(false);
    }
  };

  const handleConectar = async () => {
    setConectando(true);
    try {
      await conectarGoogle();
      setGoogleConectado(true);
      const email = await cargarEmailUsuario();
      if (email) setEmailGoogle(email);
      notificar('Cuenta de Google conectada', 'exito');
    } catch (e) {
      notificar(e instanceof Error ? e.message : 'Error al conectar Google', 'error');
    } finally {
      setConectando(false);
    }
  };

  const handleDesconectar = () => {
    desconectarGoogle();
    setGoogleConectado(false);
    setEmailGoogle('');
    notificar('Cuenta de Google desconectada', 'info');
  };

  const handleNotificaciones = async () => {
    if (notificacionesOk) return;
    const ok = await pedirPermiso();
    if (ok) {
      setNotificacionesOk(true);
      programarRecordatorios(eventos);
      notificar('Notificaciones activadas', 'exito');
    } else {
      notificar('Permiso de notificaciones denegado en el navegador', 'error');
    }
  };

  return (
    <div className="ajustes">

      {/* Google Account */}
      <Card titulo="Cuenta de Google">
        <p className="ajustes__hint">
          Conecta tu cuenta para usar Google Calendar y Gmail desde la app.
        </p>
        {googleConectado ? (
          <div className="google-status google-status--ok">
            <div className="google-status__dot google-status__dot--ok" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Conectado</div>
              {emailGoogle && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{emailGoogle}</div>}
            </div>
            <Button
              variante="secundario"
              tamano="sm"
              style={{ marginLeft: 'auto' }}
              onClick={handleDesconectar}
            >
              <Unplug size={14} /> Desconectar
            </Button>
          </div>
        ) : (
          <div className="google-status">
            <div className="google-status__dot" />
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>No conectado</span>
            <Button
              tamano="sm"
              style={{ marginLeft: 'auto' }}
              disabled={conectando}
              onClick={handleConectar}
            >
              <PlugZap size={14} /> {conectando ? 'Conectando…' : 'Conectar Google'}
            </Button>
          </div>
        )}
        <p className="ajustes__hint" style={{ marginTop: 10, marginBottom: 0 }}>
          Requiere <code>VITE_GOOGLE_CLIENT_ID</code> en tu archivo <code>.env</code>.
          Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>Google Cloud Console</a> para obtener tu Client ID.
        </p>
      </Card>

      {/* Notificaciones */}
      <Card titulo="Notificaciones">
        <p className="ajustes__hint">
          El navegador muestra alertas 15 minutos antes de cada cita (mientras la pestaña esté abierta).
        </p>
        <div className={`notif-permiso ${notificacionesOk ? 'notif-permiso--ok' : ''}`}>
          {notificacionesOk
            ? <><Bell size={16} /> Notificaciones activadas</>
            : <><BellOff size={16} /> Notificaciones desactivadas</>}
        </div>
        {!notificacionesOk && (
          <Button tamano="sm" onClick={handleNotificaciones}>
            <Bell size={14} /> Activar notificaciones
          </Button>
        )}
      </Card>

      {/* Exportar */}
      <Card titulo="Exportar datos">
        <p className="ajustes__hint">
          Descarga tus datos en CSV. "Exportar todo" genera un .zip con los tres archivos.
        </p>
        <div className="ajustes__grupo">
          <Button variante="secundario" onClick={exportarProspectos}>
            <Download size={16} /> Prospectos
          </Button>
          <Button variante="secundario" onClick={exportarAgenda}>
            <Download size={16} /> Agenda
          </Button>
          <Button variante="secundario" onClick={exportarLlamadas}>
            <Download size={16} /> Llamadas
          </Button>
          <Button
            onClick={async () => {
              await exportarTodo();
              notificar('Exportado en .zip', 'exito');
            }}
          >
            <FileArchive size={16} /> Exportar todo (.zip)
          </Button>
        </div>
      </Card>

      {/* Importar */}
      <Card titulo="Importar datos">
        <p className="ajustes__hint">
          Sube un CSV con encabezados válidos. Se validan emails y se omiten teléfonos duplicados.
        </p>
        <div className="ajustes__grupo">
          <input
            ref={refProspectos}
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) manejarImport(f, importarProspectos, 'prospectos');
              e.target.value = '';
            }}
          />
          <input
            ref={refAgenda}
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) manejarImport(f, importarAgenda, 'eventos');
              e.target.value = '';
            }}
          />
          <Button
            variante="secundario"
            disabled={importando}
            onClick={() => refProspectos.current?.click()}
          >
            <Upload size={16} /> Importar prospectos
          </Button>
          <Button
            variante="secundario"
            disabled={importando}
            onClick={() => refAgenda.current?.click()}
          >
            <Upload size={16} /> Importar agenda
          </Button>
        </div>

        {importando && (
          <div className="progress" aria-label="Progreso de importación">
            <div className="progress__bar" style={{ width: `${progreso}%` }} />
          </div>
        )}

        {resultado && (
          <div className="resultado-import">
            <b>{resultado.importados} importados</b>
            {resultado.duplicados > 0 && ` · ${resultado.duplicados} duplicados omitidos`}
            {resultado.invalidos > 0 && ` · ${resultado.invalidos} inválidos`}
            {resultado.errores.length > 0 && (
              <ul>
                {resultado.errores.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      {/* Datos de ejemplo */}
      <Card titulo="Datos de ejemplo">
        <p className="ajustes__hint">
          Genera 30 odontólogos, 15 eventos, 20 llamadas y notas asociadas.
        </p>
        <Button
          onClick={() => {
            sembrarTodo();
            notificar('Datos de ejemplo cargados', 'exito');
          }}
        >
          <Database size={16} /> Cargar datos de ejemplo
        </Button>
      </Card>

      {/* Zona peligrosa */}
      <Card titulo="Limpiar datos">
        <p className="ajustes__hint">
          Borra todos los prospectos, eventos, llamadas y notas. No se puede deshacer.
        </p>
        <Button variante="peligro" onClick={() => setConfirmLimpiar(true)}>
          <Trash2 size={16} /> Limpiar todos los datos
        </Button>
      </Card>


      {/* Backup de Landings */}
      <Card titulo="Backup de Landings">
        <p className="ajustes__hint">
          Exporta o importa tus landings en formato JSON.
        </p>
        <LandingsBackup />
      </Card>

      <Modal
        abierto={confirmLimpiar}
        titulo="¿Limpiar todos los datos?"
        onCerrar={() => setConfirmLimpiar(false)}
      >
        <p className="ajustes__hint">
          Esta acción elimina permanentemente todo el contenido guardado en este navegador.
        </p>
        <div className="form__acciones">
          <Button variante="secundario" onClick={() => setConfirmLimpiar(false)}>
            Cancelar
          </Button>
          <Button
            variante="peligro"
            onClick={() => {
              limpiarTodo();
              setConfirmLimpiar(false);
              setResultado(null);
              notificar('Todos los datos fueron eliminados', 'info');
            }}
          >
            Sí, limpiar todo
          </Button>
        </div>
      </Modal>

    </div>
  );
}
