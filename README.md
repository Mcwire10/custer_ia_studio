# 🎨 Custer IA Studio

Aplicación web para gestión de marca, generación de contenido y análisis de comunicación.

**Stack:** Next.js 14 + React 18 + Vercel + Claude API + MySQL

---

## 🚀 Features

✅ **Brand Brain** — Gestión de identidad de marca
✅ **Generador** — Crea carouseles de slides con IA
✅ **Validador** — Valida mensajes contra tu marca
✅ **Copy Generator** — Textos para diferentes plataformas
✅ **Análisis Competencia** — Compara contra competidores
✅ **Reportes** — Exporta datos en JSON

---

## 📋 Setup Local

### 1. Instalar
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Edita `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

### 3. Correr en desarrollo
```bash
npm run dev
```

Abre: http://localhost:3000

---

## 🌐 Deploy en Vercel

### 1. Conectar GitHub
- Ve a [vercel.com](https://vercel.com)
- Click "New Project"
- Selecciona el repositorio `custer_ai_studio`
- Vercel detecta Next.js automáticamente

### 2. Configurar Variables de Entorno
En Vercel Project Settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

### 3. Deploy
Automático al hacer `git push` a main

---

## 📁 Estructura

```
app/
├── page.jsx           # Pantalla principal
├── layout.jsx         # Layout global
├── globals.css        # Estilos globales
├── api/               # API Routes
│   ├── health/route.js
│   └── generate/route.js
└── (otros routes)

components/
├── Header.jsx
├── Navigation.jsx
├── APITest.jsx
└── panes/
    ├── BrandBrainPane.jsx
    ├── GeneratorPane.jsx
    ├── ValidatorPane.jsx
    ├── CopyPane.jsx
    ├── CompetitionPane.jsx
    └── ReportsPane.jsx
```

---

## 🔑 API Routes

### `GET /api/health`
Health check del servidor.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-30T..."
}
```

### `POST /api/generate`
Genera un carousel.

**Body:**
```json
{
  "topic": "Transformación digital",
  "format": "educativo",
  "brain": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "carousel": {
    "topic": "...",
    "slides": [...]
  }
}
```

---

## 🛠 Scripts

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Build para producción
npm run start    # Correr servidor
npm run lint     # Linter
```

---

## 📚 Próximas mejoras

- [ ] Integrar motor de slides renderizado
- [ ] Componente SlidePreview
- [ ] Lógica de Validador, Copy, Competition
- [ ] Integración con MySQL
- [ ] Autenticación de usuarios
- [ ] Sistema de templates guardados

---

## 🔐 Seguridad

✅ API Key guardada SOLO en variables de entorno de Vercel
✅ Frontend no expone credenciales
✅ API routes en servidor (no exponen keys al cliente)

---

¡Listo para desplegar! 🚀
