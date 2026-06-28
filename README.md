# Mi Prospectos CRM

CRM personal para gestión de prospectos, agenda, llamadas, notas y portfolio de landings.

## Stack

- React 18 + TypeScript + Vite
- Zustand (estado global + persistencia localStorage)
- React Router v6
- Recharts
- Lucide Icons
- PWA con Service Worker

## Instalación local

```bash
npm install
cp .env.example .env.local
# Editar .env.local con tu VITE_GOOGLE_CLIENT_ID
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth (Google Cloud Console) |

## Deploy en Vercel

1. Subir el repo a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Vercel detecta Vite automáticamente (`vercel.json` ya configurado)
4. Agregar `VITE_GOOGLE_CLIENT_ID` en Vercel → Settings → Environment Variables
5. Cada push a `main` dispara deploy automático

## Git inicial

```bash
git init
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
git add .
git commit -m "Initial commit: CRM prospectos"
git remote add origin https://github.com/TU_USER/mi-prospectos.git
git push -u origin main
```

## Características

- ✅ Pipeline de prospectos (Kanban + lista)
- ✅ Agenda con recordatorios
- ✅ Registro de llamadas
- ✅ Notas
- ✅ Clientes cerrados
- ✅ **Mis Landings** — portfolio de landing pages con filtros por categoría/estado
- ✅ Google Calendar + Gmail sync
- ✅ Export/Import CSV + JSON
- ✅ PWA instalable (Add to Home Screen)
- ✅ Service Worker para notificaciones push

## Estructura

```
src/
├── components/
│   ├── common/        # Button, Card, Modal, Badge…
│   ├── landings/      # LandingForm, LandingCard
│   ├── layout/        # Sidebar, Header, Layout
│   └── …
├── pages/             # DashboardPage, LandingsPage…
├── services/          # SW, export, Google auth…
├── store/             # Zustand stores
└── types/             # Tipos TypeScript centralizados
public/
├── manifest.json      # PWA manifest
└── sw.js              # Service Worker
```
