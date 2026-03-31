# 🏠🎮 CUSTER AGENCY - Project Vision

## La Gran Idea

**Transformar una herramienta de IA en un juego adictivo.**

En vez de solo "usar funciones", los usuarios gestionan una **agencia Pokémon-style** donde:
- 6 NPCs trabajan en diferentes tareas
- Completan misiones = ganan dinero de juego
- Dinero = compran ropa/items para sus personajes
- Personajes suben de nivel
- Sistema de logros y progresión

**Result:** Los usuarios vuelven cada día, completan más tareas, disfrutan la experiencia.

---

## 🎯 Problema que Resuelve

| Antes | Después |
|-------|---------|
| "Debo crear un Brand Brain" | "Juan necesita dinero para comprar ropa" |
| Tarea aburrida | Juego divertido |
| Uso puntual | Hábito diario |
| Sin sensación de progreso | +$50, +XP, Juan Level 3 → 4 |
| Olvida la app | Vuelve cada día |

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────┐
│         LOGIN 3D (PREVIEW_LOGIN_3D.html) │
│  - Animaciones impactantes              │
│  - Partículas 3D                        │
│  - Tilt effect en card                  │
└──────────────┬──────────────────────────┘
               │ (Autenticación + Init Game)
               ↓
┌─────────────────────────────────────────┐
│      CASA / GAME HUB (PREVIEW_HOUSE_HUB.html) │
│  6 Habitaciones = 6 Features           │
│  ┌─────────┬─────────┬─────────┐      │
│  │ 🧠      │ 🎨      │ ✅      │      │
│  │ Brain   │ Gen     │ Valid   │      │
│  │ [Juan]  │ [Sofia] │ [Carlos]│      │
│  └─────────┴─────────┴─────────┘      │
│  ┌─────────┬─────────┬─────────┐      │
│  │ 📝      │ 🔍      │ 📊      │      │
│  │ Copy    │ Comp    │ Reports │      │
│  │ [Lucia] │ [Marco] │ [Ana]   │      │
│  └─────────┴─────────┴─────────┘      │
│                                        │
│  💰 $2,450  ⭐ Level 5  🏅 7/12 Logros │
└──────────────┬──────────────────────────┘
               │ (Click en habitación)
               ↓
┌─────────────────────────────────────────┐
│   HABITACIÓN INDIVIDUAL (Brand Brain v3)  │
│  - NPCs trabajando                      │
│  - Interfaz de tarea                    │
│  - Completar = +$50, +XP                │
└──────────────┬──────────────────────────┘
               │ (Volver a casa)
               ↓
┌─────────────────────────────────────────┐
│   TIENDA / MODALS                       │
│  - Comprar ropa: $200-1500              │
│  - Ver progreso                         │
│  - Listar logros                        │
│  - Stats de equipo                      │
└─────────────────────────────────────────┘
```

---

## 📊 Flow de Usuario

### Día 1: Onboarding

```
1. LOGIN 3D
   ↓
2. TUTORIAL
   "Bienvenido a tu agencia"
   ↓
3. CASA - Ve 6 habitaciones + 6 NPCs
   ↓
4. ENTRA A BRAIN ROOM
   "Juan necesita ayuda"
   ↓
5. COMPLETA TAREA
   +$50 💰
   Juan: Lvl 1 → Lvl 2
   ↓
6. ABRE TIENDA
   "Con $50 puedo comprar gafas de sol..."
   ↓
7. COMPRA ITEM
   "¡Juan ahora usa gafas! 😎"
   ↓
8. LOGOUT (pero piensa: "Mañana vuelvo")
```

### Día 2-7: Sesiones Cortas

```
LOGIN → CASA
  ├─ Completar 3-4 tareas (10-15 min)
  ├─ Ganar dinero (~$150)
  ├─ Comprar 1 item (decisión: ¿para quién?)
  └─ LOGOUT
```

### Semana 2: Enganchado

```
LOGIN → CASA
  ├─ Ver que un NPC está "cansado" → entender mecánica
  ├─ Completar tareas en múltiples habitaciones
  ├─ Ganar logro (desbloquear notificación)
  ├─ Comparar su agencia con el objetivo (imagen de sueño)
  └─ Juega 30+ min sin darse cuenta
```

---

## 💾 Base de Datos

### Nuevas Tablas (6)

```sql
npcs                 -- Personajes (Juan, Sofia, etc)
inventario          -- Items que posee (ropa, decoración)
logros              -- Achievements desbloqueados
transacciones       -- Historial dinero
quests              -- Misiones (futura)
tienda_items        -- Catálogo de items
```

### Extensiones a Tablas Existentes

```sql
users
  ├─ dinero_game (INT)
  ├─ nivel_agencia (INT)
  ├─ xp_total (INT)
  └─ ultima_sesion (TIMESTAMP)
```

---

## 🎨 Componentes Visuales

### Previews Creados (3 HTML)

```
1. PREVIEW_LOGIN_3D.html
   - Logo flotante
   - Card con tilt effect (sigue mouse)
   - PIN input animado
   - Partículas 3D en fondo
   - Demostración: localhost:8888/PREVIEW_LOGIN_3D.html

2. PREVIEW_BRAND_BRAIN_V3.html
   - Formulario + Preview side-by-side
   - Partículas 3D en fondo (80 elementos)
   - Animaciones en inputs
   - Tabs con icono + label
   - Demostración: localhost:8888/PREVIEW_BRAND_BRAIN_V3.html

3. PREVIEW_HOUSE_HUB.html
   - 6 Room Cards con NPCs
   - Stats globales (dinero, nivel, logros)
   - Modals funcionales (tienda, progreso, equipo)
   - Partículas 3D (100 elementos)
   - Demostración: localhost:8888/PREVIEW_HOUSE_HUB.html
```

---

## 🔄 Game Loop

```
ENTRADA:
  usuario logueado → ver su casa

LOOP PRINCIPAL:
  1. Usuario ve casa + 6 habitaciones
  2. Elige una habitación
  3. Completa tarea (5-30 min)
  4. Recibe dinero + XP
  5. NPC sube de nivel (si X)
  6. Logro desbloqueado (si X)
  7. Vuelve a casa
  8. Abre tienda
  9. Compra item para NPC
  10. Ve a su NPC con ropa nueva
  11. Repite 2-10

SALIDA:
  usuario se va (pero piensa cuándo vuelve)

DINERO:
  Entrada: +$50 por tarea
  Salida: -$200 por item medio
  Balance: Compra cada 4 tareas
```

---

## 🎮 Mecánicas Clave

### 1. Sistema de Dinero

```
Ganancias (por completar tareas):
  - Small task (5 min)  → $25-50
  - Medium task (15 min) → $50-150
  - Large task (30+ min) → $150-500

Gastos (en tienda):
  - Item común ($50-100)  → 1-2 tareas
  - Item raro ($200-500)  → 4-10 tareas
  - Item épico ($500-1500) → 10-30 tareas
```

**Objetivo:** El usuario debe poder comprar algo cada 1-2 días.

### 2. Niveles & XP

```
Juan: Lvl 1
  ├─ 0-99 XP: Level 1
  ├─ 100-199 XP: Level 2
  ├─ 200-299 XP: Level 3
  └─ ...

Beneficios de subir:
  - Sensación de progreso
  - Desbloquea habilidades (futuro)
  - Mejora velocidad de trabajo (futuro)
```

### 3. Logros / Achievements

```
✅ Primer Diagnóstico
   → Completar 1 Brand Brain

🎨 Generador Loco
   → Generar 10 carruseles

📝 Copywriter Experto
   → Generar 100 copys

... y 9 más
```

Cada logro desbloqueado:
- Notificación satisfactoria
- Feedback visual
- Posible recompensa bonus

### 4. Estados del NPC

```
TRABAJANDO 🔴
  ├─ Animación de trabajo
  ├─ Barra de energía visible
  └─ No puede hacer más tareas

DESCANSANDO 😴
  ├─ Esperando regenerar energía
  ├─ ~5 min para estar listo
  └─ Usuario puede cambiar a otro NPC

FELIZ 😊
  ├─ Listo para trabajar
  ├─ Energía = 100%
  └─ ÓPTIMO PARA TAREAS

CANSADO 😫
  ├─ Energía < 30%
  ├─ Velocidad reducida
  └─ Mejor dejar descansar
```

---

## 📱 Responsive Design

```
Desktop (1200px+)
  └─ Casa con grid 3 columnas
     ├─ Row 1: Brain, Generator, Validator
     └─ Row 2: Copy, Competition, Reports

Tablet (768px - 1199px)
  └─ Casa con grid 2 columnas
     ├─ Row 1: Brain, Generator
     ├─ Row 2: Validator, Copy
     └─ Row 3: Competition, Reports

Mobile (< 768px)
  └─ Casa con grid 1 columna
     ├─ Brand Brain
     ├─ Generator
     ├─ Validator
     └─ ... (scroll)

  ├─ Botones en bottom: Tienda | Progreso | Equipo | Logros
```

---

## 🚀 Roadmap de Desarrollo

### MVP (Semana 1-2)
```
✅ Login 3D
✅ House Hub
✅ 6 Rooms + NPCs básicos
✅ Sistema dinero simple
✅ Tienda básica (5-10 items)
✅ Logros básicos
🔄 Integración de tareas
```

### Phase 1 (Semana 3-4)
```
- Customización completa de NPCs
- Ropa + slots (cabeza, cuerpo, pies, accesorios)
- Leveling system avanzado
- Daily quests
- Leaderboard
```

### Phase 2 (Mes 2)
```
- Habilidades especiales por NPC
- Minigames en habitaciones
- Eventos semanales
- Seasonal pass
- Monetización (Battle Pass $4.99/mes)
```

### Phase 3 (Mes 3+)
```
- Multiplayer (visitar casas de otros)
- Trading de items
- Guilds / Teams
- Global economy
- Story/Narrative
```

---

## 📊 Métricas de Éxito

| Métrica | Meta | Actual |
|---------|------|--------|
| Daily Active Users (DAU) | 100+ | TBD |
| Session duration | 20+ min | TBD |
| Retention Day 7 | 40%+ | TBD |
| Repeat task completion | 80%+ | TBD |
| Shop conversion | 20%+ | TBD |
| Avg purchase value | $3-5 USD (futuro) | TBD |

---

## 🎬 User Stories

### Story 1: Juan descubre la casa

```
COMO usuario nuevo
QUIERO ver mi agencia con personajes trabajando
PARA sentirme que estoy construyendo algo

DADO que me logueo
CUANDO entro a la aplicación
ENTONCES debo ver 6 habitaciones, cada una con un NPC
Y debo ver mi dinero + nivel + logros
```

### Story 2: Completar tarea y ganar dinero

```
COMO usuario jugador
QUIERO completar tareas y ganar dinero
PARA comprar ropa para mis NPCs

DADO que estoy en la casa
CUANDO entro a "Brain Room"
ENTONCES completo la tarea de Brand Brain
Y recibo +$50 + Juan gana +10 XP
```

### Story 3: Comprar ropa en tienda

```
COMO usuario coleccionista
QUIERO comprar ropa para mi equipo
PARA ver cómo se ven con diferentes outfits

DADO que tengo $500
CUANDO abro la tienda
ENTONCES puedo seleccionar "Hoodie Morada"
Y aplicarlo a Juan
Y verlo con ropa nueva en su habitación
```

---

## 🔐 Seguridad & Datos

```
✅ HTTP-only cookies (login)
✅ Todas las transacciones dinero en DB
✅ Validación de lado servidor
✅ No se confía en datos del cliente
✅ Logs automáticos de todas las acciones
```

---

## 📞 Soporte & Feedback

```
En cada pantalla principal:
  [?] Help icon
  └─ Abre modal con:
     - Guía de mecánicas
     - FAQ
     - Contacto de soporte
     - Cambios recientes
```

---

## 🎨 Paleta de Colores

```
Primary:   #6860EE (Púrpura Royal)
Accent:    #F5A623 (Oro)
Dark:      #0D0C1E (Casi Negro)
Success:   #4ADE80 (Verde)
Warning:   #FF6B6B (Rojo)

Uso:
  - Primary: botones, highlights, animaciones
  - Accent: llamadas a acción, dinero
  - Dark: backgrounds, bordes
  - Success: logros, dinero ganado
  - Warning: energía baja, tareas vencidas
```

---

## 📝 Documentos Relacionados

1. **GAME_DESIGN_DOC.md** - Detalles técnicos del sistema
2. **IMPLEMENTATION_ROADMAP.md** - Paso a paso desarrollo
3. **DATABASE_SETUP.sql** - Script de base de datos
4. **PREVIEW_*.html** - Demostraciones visuales

---

## 🎯 Conclusión

Este proyecto es el "siguiente nivel" de `custer_ai_studio`.

**De herramienta a juego.**

Los usuarios no solo usan features, sino que **disfrutan construir su agencia, ven progreso en tiempo real, y quieren volver cada día.**

Es la combinación perfecta de:
- ✨ Diseño hermoso (Login 3D, House Hub)
- 🎮 Mecánicas de juego (dinero, XP, logros)
- 💼 Utilidad real (tareas genuinas de IA)
- 🔄 Hábitos recurrentes (daily return)

---

**Versión 1.0 - Marzo 2026**
**Documento Living - Se actualiza con cada iteración**

*"Una agencia no es solo software. Es una experiencia. Una comunidad. Un juego que importa."*

🏠💰👥✨
