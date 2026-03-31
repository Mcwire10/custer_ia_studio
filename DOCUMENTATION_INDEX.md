# 📚 CUSTER AGENCY - Documentación Completa

## 🎯 Índice Rápido

Este proyecto es una **transformación de herramienta IA en juego de gestión de agencia** con temática Pokémon.

### 📖 Empieza por aquí:

1. **[PROJECT_VISION.md](./PROJECT_VISION.md)** ← **LEER PRIMERO**
   - Visión general del proyecto
   - Problema que resuelve
   - Game loop & mecánicas
   - User stories
   - (15 min de lectura)

2. **[GAME_DESIGN_DOC.md](./GAME_DESIGN_DOC.md)** ← **Detalles del Sistema**
   - Sistema completo de juego
   - NPCs & personajes
   - Sistema de dinero & tienda
   - Mecánicas avanzadas
   - (30 min de lectura)

3. **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** ← **Cómo Construirlo**
   - Paso a paso técnico
   - Queries SQL
   - Endpoints API
   - Componentes React
   - (Para desarrolladores)

---

## 🎬 Visuales & Previews

### 3 HTMLs Interactivos (Abre en navegador)

```bash
# Inicia el servidor (ya corriendo en puerto 8888)
python3 -m http.server 8888 --directory /Users/leandromoyano/agentes/custer_ai_studio
```

#### 1️⃣ Login 3D
**Archivo:** `PREVIEW_LOGIN_3D.html`
**URL:** `http://localhost:8888/PREVIEW_LOGIN_3D.html`

**Características:**
- ✨ Logo flotante con blur effect
- 🎮 Card que sigue el mouse (tilt)
- 🔢 PIN input con animación pop
- 💫 120 partículas 3D en fondo
- 🎬 Entrada escalonada (staggered)

**Prueba:**
1. Abre la URL
2. Mueve el mouse sobre la card
3. Escribe en los campos PIN
4. Haz clic en credencial demo

---

#### 2️⃣ Brand Brain v3
**Archivo:** `PREVIEW_BRAND_BRAIN_V3.html`
**URL:** `http://localhost:8888/PREVIEW_BRAND_BRAIN_V3.html`

**Características:**
- 📋 Formulario profesional con tabs
- 👁️ Vista previa en tiempo real
- 🎨 Color picker interactivo
- 💾 Botón con shine effect
- 🌌 80 partículas 3D flotantes
- ⚡ Animaciones en inputs

**Prueba:**
1. Abre la URL
2. Cambia los colores
3. Mira cómo se actualiza el mockup
4. Completa los campos
5. Haz clic en "Guardar"

---

#### 3️⃣ House Hub (Casa Pokémon)
**Archivo:** `PREVIEW_HOUSE_HUB.html`
**URL:** `http://localhost:8888/PREVIEW_HOUSE_HUB.html`

**Características:**
- 🏠 6 habitaciones = 6 features
- 👥 NPCs con estado (trabajando, descansando, cansado)
- 📊 Stats globales (dinero, nivel, logros)
- 🛍️ Tienda modal funcional
- 📈 Modals de progreso, equipo, logros
- 🌌 100 partículas 3D dinámicas

**Prueba:**
1. Abre la URL
2. Mira los 6 rooms con sus NPCs
3. Abre modals con los botones de abajo
4. Interactúa con la tienda

---

## 📊 Documentos Técnicos

### Base de Datos

**[DATABASE_SETUP.sql](./DATABASE_SETUP.sql)**
- Tablas existentes (users, logs, projects)
- Nuevas tablas (npcs, inventario, logros, transacciones, tienda_items)
- Datos de ejemplo
- Indices para optimización

### Skills del Proyecto

Carpeta: `/SKILLS/`

Archivos de referencia para diseño:
- `html-css-designer.md` - Guía para crear UI premium
- `brand-guardian.md` - Validación de marca
- `conversion-architect.md` - Optimización de flujo
- `brand-profile-generator.md` - Creación de perfiles
- Más...

---

## 🛠️ Estructura del Proyecto

```
custer_ai_studio/
├── 📖 DOCUMENTACIÓN
│   ├── PROJECT_VISION.md (← START HERE)
│   ├── GAME_DESIGN_DOC.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── DOCUMENTATION_INDEX.md (este archivo)
│   ├── DATABASE_SETUP.sql
│   └── CLAUDE.md (workflow original)
│
├── 🎬 PREVIEWS HTML
│   ├── PREVIEW_LOGIN_3D.html
│   ├── PREVIEW_BRAND_BRAIN_V3.html
│   └── PREVIEW_HOUSE_HUB.html
│
├── 💻 CÓDIGO FUENTE
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.js (existe)
│   │   │   ├── generate/route.js (existe)
│   │   │   ├── game/ (NUEVO)
│   │   │   ├── shop/ (NUEVO)
│   │   │   └── npc/ (NUEVO)
│   │   ├── login/
│   │   ├── app/
│   │   │   ├── page.jsx (debe importar GameHub)
│   │   │   └── app.css
│   │   ├── globals.css
│   │   └── layout.jsx
│   │
│   ├── components/
│   │   ├── GameHubPane.jsx (NUEVO)
│   │   ├── RoomCard.jsx (NUEVO)
│   │   ├── GameHub.css (NUEVO)
│   │   ├── panes/
│   │   │   ├── BrandBrainPane.v3.jsx
│   │   │   ├── GeneratorPane.jsx
│   │   │   ├── ValidatorPane.jsx
│   │   │   ├── CopyPane.jsx
│   │   │   ├── CompetitionPane.jsx
│   │   │   └── ReportsPane.jsx
│   │   └── modals/
│   │       ├── ShopModal.jsx (NUEVO)
│   │       ├── ProgressModal.jsx (NUEVO)
│   │       ├── AchievementsModal.jsx (NUEVO)
│   │       └── TeamModal.jsx (NUEVO)
│   │
│   └── lib/
│       ├── auth.js (exists)
│       ├── db.js (exists)
│       └── game.js (NUEVO - utilidades de juego)
│
├── 📁 SKILLS
│   ├── html-css-designer.md
│   ├── brand-guardian.md
│   └── (9 más)
│
└── 📄 CONFIG
    ├── package.json
    ├── next.config.js
    ├── .env.example
    ├── .gitignore
    └── .claude/launch.json
```

---

## 🚀 Pasos para Ver Todo

### Paso 1: Entender la Visión (5 min)
```
Leer: PROJECT_VISION.md
```

### Paso 2: Ver Animaciones 3D (10 min)
```
Abrir en navegador:
  1. PREVIEW_LOGIN_3D.html
  2. PREVIEW_BRAND_BRAIN_V3.html
  3. PREVIEW_HOUSE_HUB.html
```

### Paso 3: Entender el Sistema (20 min)
```
Leer: GAME_DESIGN_DOC.md (secciones 1-5)
```

### Paso 4: Plan de Implementación (15 min)
```
Leer: IMPLEMENTATION_ROADMAP.md (Phase 1 & 2)
```

### Paso 5: Para Desarrolladores
```
Leer: IMPLEMENTATION_ROADMAP.md (Code)
Revisar: DATABASE_SETUP.sql
Revisar: Estructura de componentes
```

---

## 🎮 El Game Loop Resumido

```
┌─────────────────────────────────────────┐
│  Usuario se loguea (3D animations)      │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│  Ve su Casa (6 habitaciones + NPCs)     │
│  Dinero: $2,450 | Nivel: 5 | Logros: 7 │
└─────────────────┬───────────────────────┘
                  │
          ┌───────┴────────┐
          │ (Elige)        │
          ↓                ↓
    ┌──────────┐      ┌────────────┐
    │Habitación│      │ Tienda/    │
    │(Tarea)   │      │ Modals     │
    └────┬─────┘      └────┬───────┘
         │                 │
         ↓                 ↓
    +$50 💰          -$200 para
    +XP ⭐           ropa nueva
    NPC Level ↑
         │                 │
         └────────┬────────┘
                  │
                  ↓
         Vuelve a casa (loop)
         O se desloguea (pero piensa)
```

---

## 📈 Métricas de Éxito

| Métrica | Meta |
|---------|------|
| Daily Active Users | 100+ |
| Session Duration | 20+ min |
| Task Completion Rate | 80%+ |
| Shop Conversion | 20%+ |
| Retention (Day 7) | 40%+ |
| NPC Level Up Rate | 1+ por semana |

---

## 🔗 Referencias Externas

### Inspiración Visual
- **Pokémon Mystery Dungeon** (layout isométrico)
- **Pokémon Sword & Shield** (animaciones de personajes)
- **Neopets** (sistema de mascotas)
- **Habbo Hotel** (decoración personalizable)
- **Club Penguin** (propiedad del usuario)

### Tecnologías Usadas
- **Frontend:** Next.js 14, React 18, CSS3
- **Backend:** Node.js, Next.js API Routes
- **Database:** MySQL 8.0
- **Hosting:** Vercel
- **Animations:** CSS3, Canvas 2D, vanilla JS

---

## ⚙️ Cómo Empezar Desarrollo

### Setup Local

```bash
# 1. Clonar repo
git clone https://github.com/Mcwire10/custer_ai_studio.git
cd custer_ai_studio

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env.local
# Editar con:
# ANTHROPIC_API_KEY=xxx
# MYSQL_HOST=localhost
# MYSQL_USER=root
# MYSQL_PASSWORD=xxx
# MYSQL_DATABASE=custer_ai_studio

# 4. Crear BD y correr migrations
mysql < DATABASE_SETUP.sql

# 5. Iniciar servidor
npm run dev
# Visit: http://localhost:3000/login

# 6. Ver previews HTML
python3 -m http.server 8888 --directory .
# Visit: http://localhost:8888/PREVIEW_HOUSE_HUB.html
```

---

## 📝 Checklist de Implementación

### Fase 1: Database + Backend (Semana 1)
- [ ] Crear tablas nuevas en MySQL
- [ ] Seed data de NPCs e items
- [ ] Implementar `/api/game/*` endpoints
- [ ] Implementar `/api/shop/*` endpoints
- [ ] Implementar `/api/npc/*` endpoints
- [ ] Testing de APIs con Postman

### Fase 2: Frontend (Semana 2)
- [ ] Crear `GameHubPane.jsx`
- [ ] Crear `RoomCard.jsx`
- [ ] Crear `ShopModal.jsx`
- [ ] Crear `ProgressModal.jsx`
- [ ] Integrar con tareas (complete-task)
- [ ] Testing manual end-to-end

### Fase 3: Polish (Semana 3)
- [ ] Refinamiento visual
- [ ] Optimización de performance
- [ ] Testing en mobile
- [ ] Deploy a Vercel
- [ ] Monitoreo y debugging

---

## 🎨 Colores & Tema

```css
:root {
  --primary: #6860EE;    /* Púrpura Royal */
  --accent: #F5A623;     /* Oro */
  --dark: #0D0C1E;       /* Casi Negro */
  --success: #4ADE80;    /* Verde */
  --warning: #FF6B6B;    /* Rojo */
}
```

---

## 💬 Preguntas Frecuentes

### ¿Esto es un juego o una herramienta?
**Ambas.** Es una herramienta de IA real (Brand Brain, Generator, etc.) pero envuelta en mecánicas de juego (dinero, NPCs, progresión).

### ¿El dinero es real?
**No.** Es "dinero de juego" que solo sirve para comprar cosmética. Sin monetización en MVP.

### ¿Los NPCs tienen inteligencia artificial?
**No en MVP.** Son personajes visuales. En futuro podrían tener comportamientos dinámicos.

### ¿Es multiplayer?
**No en MVP.** En Phase 2 se añade visitar casas de otros usuarios.

### ¿Cuánto tiempo lleva implementar?
**3 semanas** si lo hace 1 desarrollador full-time.
**1 semana** si lo hacen 3 desarrolladores en paralelo.

---

## 🤝 Contribuyendo

Este es un proyecto privado, pero si quieres contribuir:

1. Crea una rama: `git checkout -b feature/my-feature`
2. Commit cambios: `git commit -m 'feat: add awesome feature'`
3. Push: `git push origin feature/my-feature`
4. Abre PR con descripción clara

---

## 📞 Soporte

Problemas o preguntas:
- Revisar documentación relevante
- Abrir issue en GitHub
- Contactar directo (leandromoyano@example.com)

---

## 📜 Licencia

Privado - Custer Agency™

---

## 🙏 Créditos

- **Concepto:** @leandromoyano
- **Design:** @claude (AI)
- **Development:** (Pendiente)
- **Inspiración:** Pokémon, Neopets, Habbo Hotel

---

## 🗺️ Roadmap a Futuro

```
MVP (Hecho)
  ├─ Login 3D ✅
  ├─ House Hub ✅
  └─ Basic Game Loop ✅
        ↓
Phase 1 (Mes 1)
  ├─ Ropa + Customización
  ├─ Daily Quests
  └─ Leaderboard
        ↓
Phase 2 (Mes 2)
  ├─ Habilidades Especiales
  ├─ Minigames
  └─ Eventos Semanales
        ↓
Phase 3 (Mes 3+)
  ├─ Multiplayer
  ├─ Trading
  └─ Monetización (Battle Pass)
```

---

**Documento Vivo - Última actualización: Marzo 30, 2026**

*Para más detalles, ver documentación específica linkead arriba.* 🚀

