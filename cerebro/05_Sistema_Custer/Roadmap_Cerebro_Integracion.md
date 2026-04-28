# Roadmap — Integración Cerebro Agencia ↔ Custer AI Studio

> **Última actualización:** 2026-04-28
> **Estado:** Fase 1 completada ✅

---

## Visión del sistema integrado

```
OBSIDIAN VAULT (Cerebro Agencia)
  └─ Fuente de verdad editorial — editada por estrategas
      ├─ ADN de marcas (Markdown, versionado en git)
      ├─ Biblioteca teórica (25 libros, citas)
      ├─ System prompt Mentor Ácido
      └─ Casos de éxito documentados
              │
              │  sincronización vía git / deploy
              ▼
CUSTER AI STUDIO — /cerebro/ (copia del vault en el repo)
  └─ Motor de ejecución — usado por la IA en cada request
      ├─ Brand Brain ← importado desde ADN de Obsidian
      ├─ Modo Mentor Ácido ← usa system prompt del vault
      ├─ Citas bibliográficas ← contexto en generación
      └─ Historial de sesiones por cliente (MySQL)
```

---

## Fase 1 — Documentar ✅

**Objetivo:** Que el vault sea la fuente de verdad del sistema técnico también.

**Entregables completados:**
- [x] `05_Sistema_Custer/README.md`
- [x] `05_Sistema_Custer/Arquitectura.md`
- [x] `05_Sistema_Custer/Brand_Brain_58_Campos.md`
- [x] `05_Sistema_Custer/API_Endpoints.md`
- [x] `05_Sistema_Custer/Stack_Tecnico.md`
- [x] `05_Sistema_Custer/Deploy_Railway.md`
- [x] `05_Sistema_Custer/Roadmap_Cerebro_Integracion.md`

---

## Fase 2 — Vault en el Repo ⏳

**Objetivo:** El vault de Obsidian vive dentro del repo de Custer como `/cerebro/`. Cuando se deploya a Railway, el servidor tiene acceso a todos los archivos del cerebro en disco.

**Por qué Railway (no Vercel):**
Vercel es serverless — no tiene disco persistente. Railway sí. Los archivos Markdown del vault pueden leerse con `fs.readFileSync()` en cualquier API route.

**Pasos:**
1. Copiar el vault completo a `/custer_ai_studio/cerebro/`
2. Agregar `/cerebro/` al `.gitignore` de Obsidian (o un `.gitignore` propio)
3. Configurar un script de sync: `rsync` del vault al repo, o symlink local
4. El repo de Custer pasa a ser la fuente de deploy — el vault viaja con él

**Estructura resultante:**
```
custer_ai_studio/
└── cerebro/
    ├── 00_SOP_Agencia/
    │   └── System_Prompt_Mentor.md
    ├── 01_Biblioteca_Teorica/
    │   └── Indice_Teoria.md
    ├── 02_ADN_Marcas/
    │   ├── Drink's_ARG.md
    │   ├── Nobeles.md
    │   └── [todos los clientes]
    ├── 03_Casos_Exito/
    ├── 04_Templates/
    └── 05_Sistema_Custer/  ← este folder
```

---

## Fase 3 — Cerebro Disponible en Toda la App ⏳

**Objetivo:** Cada área de Custer puede leer del cerebro según lo que necesita.

### Arquitectura de lectura del cerebro

```javascript
// lib/cerebro.js — lector universal del vault
import fs from 'fs'
import path from 'path'

const CEREBRO_PATH = path.join(process.cwd(), 'cerebro')

export function getSystemPrompt() {
  return fs.readFileSync(
    path.join(CEREBRO_PATH, '00_SOP_Agencia/System_Prompt_Mentor.md'),
    'utf-8'
  )
}

export function getTeoriaBiblioteca() {
  return fs.readFileSync(
    path.join(CEREBRO_PATH, '01_Biblioteca_Teorica/Indice_Teoria.md'),
    'utf-8'
  )
}

export function getADNMarca(nombreCliente) {
  // Busca el archivo .md del cliente en 02_ADN_Marcas/
  const files = fs.readdirSync(path.join(CEREBRO_PATH, '02_ADN_Marcas'))
  const match = files.find(f => f.toLowerCase().includes(nombreCliente.toLowerCase()))
  if (!match) return null
  return fs.readFileSync(path.join(CEREBRO_PATH, '02_ADN_Marcas', match), 'utf-8')
}
```

### Qué lee cada área de Custer

| Área de Custer | Lee del Cerebro |
|---|---|
| **Generador** | System Prompt Mentor + Biblioteca Teórica + ADN del cliente activo |
| **Validador** | System Prompt Mentor + ADN del cliente (para verificar coherencia) |
| **Copy Generator** | Biblioteca Teórica (para citas) + Voz/Tono del ADN |
| **Análisis de Competencia** | ADN del cliente + posicionamiento del vault |
| **Auto-población de Brand Brain** | Template ADN de Obsidian como guía de extracción |

### Import ADN Obsidian → Brand Brain MySQL

Script que convierte el Markdown del vault al JSON del Brand Brain:

```javascript
// scripts/import-adn-to-brain.js
// Lee Drink's_ARG.md → extrae campos → POST /api/brands
// Mapeo: secciones Markdown → campos JSON del Brain
```

**Mapeo principal:**
```
## Ficha de Identidad        → slide 1 (nombre, sector, audiencia)
## Esencia de Marca          → slide 3 (proposito, vision)
## Personalidad de Marca     → slide 2 (voz, tono, actitud, energia)
## Arquetipos de Marca       → slide 3 (valores)
## Valores Fundamentales     → slide 3 (valores)
## Territorio Visual         → slide 5 (color, tipografia, fotografia)
## Mensajes Clave            → slide 7 (mensajes_clave)
## Lo que esta marca NO es   → slide 2 (maximas)
## Notas Estratégicas        → slide 3 (diferenciadores)
```

---

## Flujo de actualización continua

Una vez integrado, el ciclo de vida del conocimiento es:

```
Estratega actualiza ficha en Obsidian
    ↓
git commit + push al repo de Custer
    ↓
Railway redeploya automáticamente (o pull manual)
    ↓
El cerebro actualizado está disponible en todos los endpoints
    ↓
Generador, Validador y Copy ya usan la info nueva sin configuración extra
```

---

## Prioridad de implementación

1. **Alta:** Fase 2 — vault al repo (habilita todo lo demás)
2. **Alta:** `lib/cerebro.js` — lector universal (pieza central)
3. **Media:** Integrar en `/api/generate` y `/api/validate`
4. **Media:** Script de import ADN → Brand Brain
5. **Baja:** Integrar en competencia y copy generator
