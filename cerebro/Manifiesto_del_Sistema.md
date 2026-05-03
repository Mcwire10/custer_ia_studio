# Manifiesto del Sistema — Custer AI Studio

> **Última actualización:** 2026-05-03  
> **Versión:** v2.0 — Producción  
> **Autor:** Leandro Moyano (Custer)

---

## 1. Qué es Custer AI Studio

Una aplicación web que funciona como el **brazo ejecutor del Cerebro Agencia**. Toma el conocimiento estratégico del vault de Obsidian (ADNs de marca, biblioteca teórica, system prompts) y lo convierte en contenido real mediante IA.

**Problema que resuelve:** Una agencia creativa necesita validar, generar y optimizar contenido publicitario alineado con la identidad de cada cliente, usando fundamentos de marketing de 25+ libros como respaldo.

---

## 2. Arquitectura general

```
OBSIDIAN VAULT (Fuente de verdad estratégica)
  ├─ ADN de Marcas (17 clientes .md)
  ├─ Biblioteca Teórica (25 libros de marketing)
  ├─ System Prompt Mentor Ácido
  └─ Templates de casos de éxito
          │
          │  Copia manual + script de importación
          ▼
MYSQL (Hostinger)
  ├─ brands (17 marcas, 58 campos cada una)
  ├─ content_library (26 contenidos teóricos)
  ├─ system_prompts (Mentor Ácido)
  └─ templates (ADN + Caso Éxito)
          │
          │  API endpoints (Next.js App Router)
          ▼
CUSTER AI STUDIO (Vercel)
  ├─ /api/brands → CRUD de marcas
  ├─ /api/validate → Validador (Gemini IA)
  ├─ /api/generate → Generador de piezas visuales
  ├─ /api/copy → Generador de copy
  └─ /api/competition → Análisis competitivo
          │
          ▼
FRONTEND (studio-v2.html)
  ├─ 🎯 Validador (Mentor Ácido)
  ├─ 🎨 Generador (piezas visuales)
  ├─ ✍️ Copy (generación de textos)
  └─ 🧠 Brand Brain (gestión de marcas)
```

---

## 3. Módulos principales

### 3.1 Validador (`/api/validate`)
- **Qué hace:** Analiza un copy/texto contra el ADN de la marca seleccionada y la biblioteca teórica
- **IA:** Gemini 2.0 Flash
- **Input:** Copy + tipo de contenido + objetivo + plataforma + marca actual
- **Output:** Score, diagnóstico, 3 versiones mejoradas (directa, narrativa, disruptiva), aprendizaje clave
- **Contexto:** Lee el system prompt del Mentor Ácido + biblioteca teórica + ADN de la marca

### 3.2 Generador (`/api/generate`)
- **Qué hace:** Genera piezas visuales HTML/CSS a partir de un brief
- **IA:** Claude (Anthropic) → Gemini (en migración)
- **Input:** Brief de la pieza + formato + marca actual + assets
- **Output:** HTML/CSS renderizado con preview + código descargable

### 3.3 Copy (`/api/copy`)
- **Qué hace:** Genera copys publicitarios optimizados
- **IA:** Gemini
- **Input:** Tema/producto + objetivo + plataformas + mensaje central + CTA
- **Output:** Variantes A/B de copy con headlines, body, CTA

### 3.4 Brand Brain
- **Qué hace:** Gestión de fichas de marca (58 campos)
- **Datos:** MySQL
- **Funcionalidades:** Cargar desde cero, importar desde Instagram, archivo, o URL
- **Slides:** 6 secciones que cubren identidad, personalidad, valores, tono, visual, métricas

### 3.5 Competencia (`/api/competition`)
- **Estado:** En construcción ⚠️
- Analiza competidores y su posicionamiento

### 3.6 Reportes y Analytics
- **Estado:** En construcción ⚠️
- Métricas de redes sociales y performance

---

## 4. Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML/CSS/JS vanilla (studio-v2.html, ~8300 líneas) |
| Backend | Next.js 14 (App Router) |
| Base de datos | MySQL (Hostinger: srv1081.hstgr.io) |
| IA Principal | Gemini 2.0 Flash (Google AI) |
| IA Secundaria | Claude 3.5 (Anthropic, en migración) |
| Imágenes | gpt-image-1 |
| Tipografía | Gotham Bold + Medium (local), Source Sans 3 (Google Fonts) |
| Animaciones | GSAP 3.12 |
| Deploy | Vercel (producción: custer-ia-studio.vercel.app) |
| Documentación | Obsidian (vault: Cerebro agencia/) |

---

## 5. Colores de Custer (ADN)

| Color | Hex | Uso |
|-------|-----|-----|
| Brand | `#3d39ac` | Principal, botones, acentos |
| Accent | `#ffc80f` | Llamados a la acción, destacados |
| Brand Light | `#8253cc` | Gradientes, fondos |
| Accent Tertiary | `#6ac7ba` | Éxito, confirmaciones |

---

## 6. Flujo de trabajo típico

```
1. Usuario selecciona una marca en el dropdown
      ↓
2. Brand Brain carga el ADN completo desde MySQL
      ↓
3. Usuario elige el módulo (Validador, Generador, Copy)
      ↓
4. Completa el formulario con el contenido/brief
      ↓
5. La API recibe: contenido + ADN de marca + contexto de biblioteca
      ↓
6. Gemini/Claude procesa con el system prompt del Mentor Ácido
      ↓
7. Resultado se renderiza en el panel derecho
      ↓
8. Usuario itera, descarga, o pasa a otro módulo
```

---

## 7. La Biblioteca Teórica

25 libros de marketing en 5 categorías. Cada uno tiene:
- Ideas principales
- Citas aplicables
- Cómo usarlo en la agencia

**Ubicación:**
- Obsidian: `Cerebro agencia/01_Biblioteca_Teorica/`
- Repo: `cerebro/01_Biblioteca_Teorica/`
- MySQL: tabla `content_library`

Ver [[01_Biblioteca_Teorica/Indice_Teoria|Índice completo]].

---

## 8. Ramas Git y Deploy

| Rama | URL | Uso |
|------|-----|-----|
| `main` | https://custer-ia-studio.vercel.app | Producción (lo que ve el usuario) |
| `dev` | https://custer-ia-studio-git-dev-*.vercel.app | Desarrollo (pruebas) |

**Workflow:** Trabajar en `dev` → Merge a `main` cuando esté probado → Vercel deploy automático.

---

## 9. Cómo agregar una marca nueva

1. Crear el archivo `.md` en `02_ADN_Marcas/` (seguir [[04_Templates/Template_ADN_Marcas|Template]])
2. Ejecutar:
```bash
curl -X POST http://localhost:3000/api/setup/import-cerebro
```
3. La marca aparece en el dropdown de producción al recargar

---

## 10. Cómo agregar un libro a la biblioteca

1. Crear el archivo `.md` en `01_Biblioteca_Teorica/` con el formato:
   - Título, autor, año
   - Ideas principales
   - Citas aplicables
   - Cómo aplicarlo
2. Agregar la entrada en `Indice_Teoria.md`
3. Ejecutar el script de importación

---

## 11. Archivos clave del proyecto

| Archivo | Propósito |
|---------|-----------|
| `public/studio-v2.html` | Frontend completo (8300 líneas) |
| `app/api/validate/route.js` | Endpoint del Validador |
| `app/api/generate/route.js` | Endpoint del Generador |
| `app/api/copy/route.js` | Endpoint de Copy |
| `app/api/brands/route.js` | CRUD de marcas |
| `lib/auth.js` | Autenticación (bypass admin/1234) |
| `lib/db.js` | Conexión MySQL |
| `lib/cerebro.js` | Lector del vault |
| `lib/gemini.js` | Wrapper de Gemini API |
| `vercel.json` | Config de Vercel |

---

## 12. Troubleshooting rápido

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| Marcas no cargan | DB_HOST no configurado en Vercel | Verificar env vars en Vercel Dashboard |
| Error 401 en API | Auth requerida | Asegurar bypass en dev |
| Gemini no responde | Cuota excedida | Esperar 1 minuto (se resetea) |
| Tabs no muestran contenido | Error JS en consola | Ver F12 > Console |
| Deploy no se actualiza | Rama equivocada | Verificar `git branch` y `vercel --prod` |

---

## 13. Links

- **App producción:** https://custer-ia-studio.vercel.app/studio-v2.html
- **App local:** http://localhost:3000/studio-v2.html
- **Vercel Dashboard:** https://vercel.com/mcwire10s-projects/custer-ia-studio
- **GitHub:** https://github.com/Mcwire10/custer_ia_studio
- **Obsidian Vault:** `Cerebro agencia/`
- **Sesiones:** `05_Sistema_Custer/Sesion_*.md`
