import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProspectosPage } from '@/pages/ProspectosPage';
import { AgendaPage } from '@/pages/AgendaPage';
import { LlamadasPage } from '@/pages/LlamadasPage';
import { NotasPage } from '@/pages/NotasPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ClientesCerradosPage } from '@/pages/ClientesCerradosPage';
import { LandingsPage } from '@/pages/LandingsPage';
import { useAgendaStore, useUIStore } from '@/store';
import { estaConectado, getEmailGuardado } from '@/services/googleAuthService';
import { programarRecordatorios, tienePermiso, verificarRecordatoriosEmail } from '@/services/notificacionesService';
import { enviarEmailLibre } from '@/services/gmailService';
import { useProspectosStore } from '@/store';

export default function App() {
  const eventos         = useAgendaStore((s) => s.eventos);
  const setGoogleConectado = useUIStore((s) => s.setGoogleConectado);
  const prospectos      = useProspectosStore((s) => s.prospectos);

  // Tema oscuro permanente (sin toggle). Se aplica al <html> una sola vez.
  useEffect(() => {
    document.documentElement.dataset.theme = 'oscuro';
  }, []);

  // Sincronizar estado de Google con el store en cada carga
  useEffect(() => {
    if (estaConectado()) setGoogleConectado(true);
  }, [setGoogleConectado]);

  // Programar notificaciones del navegador cuando cambia la agenda
  useEffect(() => {
    if (tienePermiso()) programarRecordatorios(eventos);
  }, [eventos]);

  // Verificar recordatorios por email (1h antes) al montar
  useEffect(() => {
    if (!estaConectado()) return;
    verificarRecordatoriosEmail(eventos, async (ev) => {
      const p = ev.prospectoId
        ? prospectos.find((x) => x.id === ev.prospectoId)
        : undefined;
      if (!p?.email) return;
      await enviarEmailLibre(
        p.email,
        `Recordatorio: ${ev.titulo}`,
        `Tu cita "${ev.titulo}" comienza en menos de 1 hora.`,
        getEmailGuardado()
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // sólo al montar

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="prospectos" element={<ProspectosPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="llamadas" element={<LlamadasPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="clientes" element={<ClientesCerradosPage />} />
        <Route path="landings" element={<LandingsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
