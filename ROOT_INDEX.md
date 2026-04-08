# 📁 Custer AI Studio - Índice de Carpetas

## 🎯 RAÍZ - Archivos Críticos SOLO

```
RAÍZ/
├── 📘 CLAUDE.md              ← Instrucciones para IA
├── 📖 README.md              ← Descripción del proyecto
├── ⚙️  package.json           ← Dependencias npm
├── ⚙️  next.config.js         ← Config Next.js
├── ⚙️  jsconfig.json          ← Config JavaScript
├── ⚙️  middleware.js          ← Middleware Next.js
├── 🚀 start-dev.sh            ← Script para iniciar servidor
│
├── 📚 docs/                   ← TODA la documentación
│   ├── BRAND_BRAIN_QUICK_START.md          ← 👈 EMPIEZA AQUÍ
│   ├── BRAND_BRAIN_INTEGRATION_GUIDE.md
│   ├── BRAND_BRAIN_STRUCTURE.md
│   ├── BRAND_BRAIN_EXPANSION_SUMMARY.md
│   ├── DELIVERABLES_SESSION3.md
│   ├── PROJECT_STRUCTURE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── STYLE_GUIDE_CLEANUP.md
│   ├── BRAND_LOADER_README.md
│   ├── BRAND_LOADER_SETUP.md
│   ├── DATABASE_SETUP.sql
│   ├── QUICKSTART.md
│   └── ... otros docs
│
├── 🔧 scripts/                ← Scripts útiles
│   ├── start-dev.sh           (También en raíz)
│   ├── test-endpoints.sh      ← Testing de APIs
│   ├── diagnostics.sh         ← Diagnóstico
│   └── INSTALL_AND_RUN.sh     ← Setup inicial
│
├── 💻 app/                    ← CÓDIGO Next.js
│   ├── api/                   ← Endpoints REST
│   ├── lib/
│   └── ...
│
├── 🎨 public/                 ← Archivos servidos
│   ├── brand-loader.html
│   ├── studio-v2.html
│   ├── PREVIEW_UI_DEMO.html
│   ├── BRAND_BRAIN_EXPANDED_SLIDES.html
│   └── ...
│
├── 📦 lib/                    ← Funciones compartidas
│   └── brands-db.js
│
├── 🎮 SKILLS/                 ← Integraciones
├── 🏗️  components/            ← React components
├── ✅ tasks/                  ← Todo lists
├── 🗑️  trash/                 ← Archivos viejos (puedes borrar)
└── node_modules/             ← Dependencias (autogenerado)
```

---

## 🎯 Dónde Encontrar Qué

| Necesito... | Dónde buscar |
|-------------|-------------|
| Comenzar integración | `/docs/BRAND_BRAIN_QUICK_START.md` |
| Paso a paso (programador) | `/docs/BRAND_BRAIN_INTEGRATION_GUIDE.md` |
| Cómo funciona | `/docs/BRAND_BRAIN_STRUCTURE.md` |
| APIs | `/app/api/` |
| UI/UX | `/public/studio-v2.html` |
| Nueva UI Preview | `http://localhost:3001/PREVIEW_UI_DEMO.html` |
| Dependencias | `package.json` |
| Secretos (.env) | `.env.local` (no en git) |
| Scripts | `/scripts/` |
| Archivos viejos | `/trash/` |

---

## ✨ Quick Start

```bash
# 1. Leer documentación
cat docs/BRAND_BRAIN_QUICK_START.md

# 2. Instalar dependencias
npm install

# 3. Configurar .env.local
cp .env.example .env.local
# Editar con tus APIS keys

# 4. Iniciar servidor
npm run dev
# O: bash start-dev.sh
```

---

## 📞 Para Programador

1. Lee: `/docs/BRAND_BRAIN_QUICK_START.md`
2. Lee: `/docs/BRAND_BRAIN_INTEGRATION_GUIDE.md`
3. Copia: `/public/BRAND_BRAIN_EXPANDED_SLIDES.html`
4. Sigue pasos en Fase 1

---

**Status**: ✅ Limpio y organizado
**Última actualización**: 2026-04-07
