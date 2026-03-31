# 🛠️ IMPLEMENTATION ROADMAP - Casa Pokémon para Agencia

## OVERVIEW

Convertir la experiencia de `custer_ai_studio` en un **juego de gestión de agencia** donde las 6 pestañas se transforman en habitaciones de una casa Pokémon, cada una con un NPC trabajando.

---

## FASE 1: DATABASE SETUP (1-2 días)

### 1.1 Crear Tablas Nuevas

```sql
-- Extender users
ALTER TABLE users ADD COLUMN (
  dinero_game INT DEFAULT 0,
  nivel_agencia INT DEFAULT 1,
  xp_total INT DEFAULT 0,
  ultima_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NPCs asociados a usuarios
CREATE TABLE npcs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  npc_id VARCHAR(50) UNIQUE, -- "juan", "sofia", etc
  nombre VARCHAR(100),
  rol VARCHAR(100),
  habitacion VARCHAR(50),
  nivel INT DEFAULT 1,
  experiencia INT DEFAULT 0,
  energia INT DEFAULT 100,
  humor ENUM('feliz', 'neutral', 'cansado') DEFAULT 'feliz',
  tareas_completadas INT DEFAULT 0,
  dinero_generado INT DEFAULT 0,
  avatar_skin VARCHAR(100) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id)
);

-- Inventario del jugador
CREATE TABLE inventario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id VARCHAR(100), -- "hoodie_morada", "gafas_sol", etc
  item_tipo ENUM('ropa', 'decoracion', 'power-up') DEFAULT 'ropa',
  cantidad INT DEFAULT 1,
  equipo_npc_id VARCHAR(50), -- Qué NPC lo está usando (null = no equipado)
  slot VARCHAR(50), -- "cabeza", "cuerpo", "pies", "accesorios"
  fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_item (user_id, item_id),
  INDEX idx_user (user_id)
);

-- Logros desbloqueados
CREATE TABLE logros (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  logro_id VARCHAR(100), -- "primer_diagnostico", etc
  nombre VARCHAR(150),
  descripcion TEXT,
  icono VARCHAR(50), -- emoji
  desbloqueado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_logro (user_id, logro_id),
  INDEX idx_user (user_id)
);

-- Historial de transacciones
CREATE TABLE transacciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tipo ENUM('ganancia', 'gasto') DEFAULT 'ganancia',
  monto INT,
  concepto VARCHAR(200),
  habitacion VARCHAR(50),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_fecha (fecha)
);

-- Store de items
CREATE TABLE tienda_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id VARCHAR(100) UNIQUE,
  nombre VARCHAR(150),
  tipo ENUM('ropa', 'decoracion', 'power-up'),
  icono VARCHAR(50),
  precio INT,
  rareza ENUM('comun', 'rara', 'epica', 'legendaria') DEFAULT 'comun',
  descripcion TEXT,
  wearable_por VARCHAR(200), -- "juan,sofia,carlos" o "all"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests/Misiones
CREATE TABLE quests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  quest_id VARCHAR(100),
  habitacion VARCHAR(50),
  titulo VARCHAR(150),
  descripcion TEXT,
  recompensa_dinero INT,
  recompensa_xp INT,
  completada BOOLEAN DEFAULT FALSE,
  completada_en TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id)
);
```

### 1.2 Seed Data - Items Tienda

```sql
INSERT INTO tienda_items (item_id, nombre, tipo, icono, precio, rareza, descripcion, wearable_por) VALUES
  ('hoodie_morada', 'Hoodie Morada Premium', 'ropa', '👕', 500, 'epica', 'La sudadera signature de Custer', 'all'),
  ('gafas_sol', 'Gafas de Sol Retro', 'ropa', '🕶️', 150, 'rara', 'Estilo vintage, look profesional', 'all'),
  ('lentes_gamer', 'Lentes Gamer RGB', 'ropa', '🎮', 350, 'rara', 'Para los analistas de datos', 'all'),
  ('gorro_chef', 'Gorro de Chef', 'ropa', '🎩', 200, 'rara', 'Para los creativos', 'all'),
  ('blazer', 'Blazer Clásico', 'ropa', '👔', 300, 'rara', 'Profesionalismo puro', 'all'),
  ('zapatillas_premium', 'Zapatillas Premium', 'ropa', '👟', 280, 'rara', 'Comodidad y estilo', 'all');
```

### 1.3 Seed Data - NPCs

```sql
INSERT INTO npcs (user_id, npc_id, nombre, rol, habitacion, nivel, energia, humor) VALUES
  (1, 'juan', 'Juan', 'Brand Specialist', 'Brain Room', 1, 100, 'feliz'),
  (1, 'sofia', 'Sofia', 'Creative Lead', 'Generator Room', 1, 100, 'feliz'),
  (1, 'carlos', 'Carlos', 'Data Analyst', 'Validator Room', 1, 100, 'feliz'),
  (1, 'lucia', 'Lucia', 'Copywriter', 'Copy Room', 1, 100, 'feliz'),
  (1, 'marco', 'Marco', 'Researcher', 'Competition Room', 1, 100, 'feliz'),
  (1, 'ana', 'Ana', 'Data Scientist', 'Reports Room', 1, 100, 'feliz');
```

---

## FASE 2: BACKEND APIS (2-3 días)

### 2.1 Rutas de Juego

**`POST /api/game/init` - Inicializar juego para usuario**

```javascript
// Request body
{}

// Response
{
  usuario: {
    id: 1,
    dinero_game: 0,
    nivel_agencia: 1,
    xp_total: 0
  },
  npcs: [
    {
      npc_id: "juan",
      nombre: "Juan",
      habitacion: "Brain Room",
      nivel: 1,
      energia: 100,
      humor: "feliz"
    },
    // ... 5 más
  ],
  inventario: [],
  logros: [],
  mensaje: "¡Bienvenido a tu agencia!"
}
```

**`GET /api/game/state` - Obtener estado actual**

```javascript
// Response
{
  usuario: { dinero_game, nivel_agencia, xp_total },
  npcs: [ /* array de NPCs */ ],
  inventario: [ /* items que tiene */ ],
  logros: [ /* logros desbloqueados */ ],
  transacciones_recientes: [ /* últimas 10 */ ]
}
```

**`POST /api/game/complete-task` - Completar una tarea**

```javascript
// Request body
{
  habitacion: "Brain Room",
  tarea_id: "crear_brand_profile",
  tiempo_invertido: 15 // minutos
}

// Response
{
  dinero_ganado: 75,
  xp_ganado: 15,
  npc: { /* Juan actualizado */ },
  nivel_subio: false,
  logro_desbloqueado: null,
  nueva_energia: 85
}
```

### 2.2 Rutas de Tienda

**`GET /api/shop/items` - Listar items disponibles**

```javascript
// Query params
?tipo=ropa&limit=20

// Response
{
  items: [
    {
      item_id: "hoodie_morada",
      nombre: "Hoodie Morada Premium",
      tipo: "ropa",
      precio: 500,
      rareza: "epica",
      icono: "👕"
    },
    // ...
  ]
}
```

**`POST /api/shop/buy-item` - Comprar item**

```javascript
// Request body
{
  item_id: "hoodie_morada"
}

// Response
{
  exito: true,
  dinero_restante: 1950,
  item_comprado: { /* item */ },
  inventario: [ /* actualizado */ ],
  mensaje: "¡Hoodie adquirida!"
}
```

### 2.3 Rutas de Customización

**`POST /api/npc/equip-item` - Equipar item a NPC**

```javascript
// Request body
{
  npc_id: "juan",
  item_id: "hoodie_morada",
  slot: "cuerpo"
}

// Response
{
  exito: true,
  npc: { /* juan actualizado con ropa */ },
  inventario: [ /* updated */ ]
}
```

**`GET /api/npc/stats` - Stats completo de un NPC**

```javascript
// Response
{
  npc_id: "juan",
  nombre: "Juan",
  nivel: 3,
  experiencia: 450,
  energia: 75,
  tareas_completadas: 23,
  dinero_generado: 2450,
  equipo: {
    cabeza: null,
    cuerpo: "hoodie_morada",
    pies: "tenis_gold",
    accesorios: null
  }
}
```

### 2.4 Rutas de Progreso

**`GET /api/achievements` - Lista de logros**

```javascript
// Response
{
  total: 12,
  desbloqueados: 7,
  logros: [
    {
      logro_id: "primer_diagnostico",
      nombre: "Primer Diagnóstico",
      descripcion: "Completar 1 Brand Brain",
      icono: "✅",
      desbloqueado: true,
      desbloqueado_en: "2026-03-30T14:30:00Z"
    },
    {
      logro_id: "copywiter_experto",
      nombre: "Copywriter Experto",
      descripcion: "Generar 100 copys",
      icono: "📝",
      desbloqueado: false,
      progreso: "47/100"
    }
    // ...
  ]
}
```

### 2.5 Implementación en Node.js

**`app/api/game/init/route.js`**

```javascript
import { query } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req) {
  const user = await getCurrentUser(req)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Crear NPCs para el usuario
    const npcs = [
      { npc_id: 'juan', nombre: 'Juan', habitacion: 'Brain Room', rol: 'Brand Specialist' },
      { npc_id: 'sofia', nombre: 'Sofia', habitacion: 'Generator Room', rol: 'Creative Lead' },
      { npc_id: 'carlos', nombre: 'Carlos', habitacion: 'Validator Room', rol: 'Data Analyst' },
      { npc_id: 'lucia', nombre: 'Lucia', habitacion: 'Copy Room', rol: 'Copywriter' },
      { npc_id: 'marco', nombre: 'Marco', habitacion: 'Competition Room', rol: 'Researcher' },
      { npc_id: 'ana', nombre: 'Ana', habitacion: 'Reports Room', rol: 'Data Scientist' }
    ]

    for (const npc of npcs) {
      await query(
        `INSERT INTO npcs (user_id, npc_id, nombre, habitacion, rol, nivel, energia, humor)
         VALUES (?, ?, ?, ?, ?, 1, 100, 'feliz')
         ON DUPLICATE KEY UPDATE nombre=VALUES(nombre)`,
        [user.id, npc.npc_id, npc.nombre, npc.habitacion, npc.rol]
      )
    }

    // Actualizar usuario
    await query(
      `UPDATE users SET nivel_agencia = 1, xp_total = 0, dinero_game = 0 WHERE id = ?`,
      [user.id]
    )

    // Log activity
    await logActivity(user.id, 'GAME_INIT', { npcs_creados: 6 }, 'SUCCESS')

    return Response.json({
      usuario: { id: user.id, dinero_game: 0, nivel_agencia: 1, xp_total: 0 },
      npcs: npcs.map(n => ({ ...n, nivel: 1, energia: 100, humor: 'feliz' })),
      inventario: [],
      logros: [],
      mensaje: '¡Bienvenido a tu agencia!'
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

**`app/api/game/complete-task/route.js`**

```javascript
import { query } from '@/lib/db'
import { getCurrentUser, logActivity } from '@/lib/auth'

export async function POST(req) {
  const user = await getCurrentUser(req)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { habitacion, tarea_id, tiempo_invertido } = await req.json()

  try {
    // Calcular dinero basado en tiempo
    const dinero_base = Math.floor(tiempo_invertido * 3.33) // $50 por 15 min
    const dinero_ganado = Math.max(25, Math.min(500, dinero_base))
    const xp_ganado = Math.floor(tiempo_invertido / 2)

    // Actualizar usuario
    await query(
      `UPDATE users SET dinero_game = dinero_game + ?, xp_total = xp_total + ? WHERE id = ?`,
      [dinero_ganado, xp_ganado, user.id]
    )

    // Mapear habitación a NPC
    const npc_map = {
      'Brain Room': 'juan',
      'Generator Room': 'sofia',
      'Validator Room': 'carlos',
      'Copy Room': 'lucia',
      'Competition Room': 'marco',
      'Reports Room': 'ana'
    }
    const npc_id = npc_map[habitacion]

    // Actualizar NPC
    const [npc] = await query(
      `SELECT * FROM npcs WHERE user_id = ? AND npc_id = ?`,
      [user.id, npc_id]
    )

    await query(
      `UPDATE npcs
       SET experiencia = experiencia + ?,
           tareas_completadas = tareas_completadas + 1,
           dinero_generado = dinero_generado + ?,
           energia = MAX(0, energia - 15),
           nivel = CASE WHEN experiencia + ? >= nivel * 100 THEN nivel + 1 ELSE nivel END
       WHERE user_id = ? AND npc_id = ?`,
      [xp_ganado, dinero_ganado, xp_ganado, user.id, npc_id]
    )

    // Registrar transacción
    await query(
      `INSERT INTO transacciones (user_id, tipo, monto, concepto, habitacion)
       VALUES (?, 'ganancia', ?, ?, ?)`,
      [user.id, dinero_ganado, `Tarea completada: ${tarea_id}`, habitacion]
    )

    // Verificar logros
    const logros_desbloqueados = await checkAchievements(user.id, habitacion)

    // Log activity
    await logActivity(user.id, 'TASK_COMPLETE', { tarea_id, dinero: dinero_ganado }, 'SUCCESS')

    return Response.json({
      dinero_ganado,
      xp_ganado,
      npc_actualizado: npc,
      logros_desbloqueados,
      mensaje: `+$${dinero_ganado} 💰`
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

async function checkAchievements(user_id, habitacion) {
  // Verificar si hay logros para desbloquear
  const logros_desbloqueables = {
    'Brain Room': 'primer_diagnostico',
    'Generator Room': 'generador_loco',
    'Validator Room': 'validador_pro',
    'Copy Room': 'copywiter_experto',
    'Competition Room': 'observador',
    'Reports Room': 'reportero'
  }

  const logro = logros_desbloqueables[habitacion]
  if (!logro) return []

  // Verificar si ya está desbloqueado
  const [existing] = await query(
    `SELECT * FROM logros WHERE user_id = ? AND logro_id = ?`,
    [user_id, logro]
  )

  if (existing) return []

  // Desbloquear logro
  await query(
    `INSERT INTO logros (user_id, logro_id, nombre, descripcion, icono)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, logro, 'Logro', 'Desbloqueado', '🏅']
  )

  return [{ logro_id: logro, desbloqueado: true }]
}
```

---

## FASE 3: FRONTEND COMPONENTS (3-4 días)

### 3.1 Estructura de Componentes React

**`components/GameHubPane.jsx`** (Reemplaza a PanesContainer)

```javascript
'use client'

import { useState, useEffect } from 'react'
import RoomCard from './RoomCard'
import ShopModal from './modals/ShopModal'
import ProgressModal from './modals/ProgressModal'
import './GameHub.css'

export default function GameHubPane() {
  const [gameState, setGameState] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGameState()
  }, [])

  const fetchGameState = async () => {
    try {
      const res = await fetch('/api/game/state')
      const data = await res.json()
      setGameState(data)
    } catch (error) {
      console.error('Error cargando estado del juego:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando tu agencia...</div>

  const rooms = [
    {
      icon: '🧠',
      nombre: 'Brain Room',
      subtitle: 'Crear perfiles de marca',
      habitacion: 'Brain Room',
      npc: 'juan'
    },
    {
      icon: '🎨',
      nombre: 'Generator Room',
      subtitle: 'Generar carruseles',
      habitacion: 'Generator Room',
      npc: 'sofia'
    },
    // ... 4 más
  ]

  return (
    <div className="game-hub">
      <div className="game-header">
        <h1>🏠 Custer Agency</h1>
        <div className="game-stats">
          <div className="stat">
            <span>💰</span>
            <div>
              <div>Dinero</div>
              <div>${gameState.usuario.dinero_game}</div>
            </div>
          </div>
          <div className="stat">
            <span>⭐</span>
            <div>
              <div>Nivel</div>
              <div>{gameState.usuario.nivel_agencia}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rooms-grid">
        {rooms.map(room => (
          <RoomCard
            key={room.habitacion}
            room={room}
            npc={gameState.npcs.find(n => n.npc_id === room.npc)}
            onEnter={() => handleEnterRoom(room.habitacion)}
          />
        ))}
      </div>

      <div className="game-footer">
        <button onClick={() => setActiveModal('shop')}>🛍️ Tienda</button>
        <button onClick={() => setActiveModal('progress')}>📈 Progreso</button>
        <button onClick={() => setActiveModal('team')}>👥 Equipo</button>
        <button onClick={() => setActiveModal('achievements')}>🏅 Logros</button>
      </div>

      {activeModal === 'shop' && <ShopModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'progress' && <ProgressModal gameState={gameState} />}
      {/* ... más modals */}
    </div>
  )
}
```

**`components/RoomCard.jsx`**

```javascript
'use client'

export default function RoomCard({ room, npc, onEnter }) {
  return (
    <div className="room-card">
      <div className="room-icon">{room.icon}</div>
      <div className="room-name">{room.nombre}</div>
      <div className="room-subtitle">{room.subtitle}</div>

      <div className="npc-display">
        <div className="npc-avatar">
          {getNPCEmoji(room.npc)}
        </div>
        <div className="npc-name">{npc?.nombre}</div>
        <div className="npc-status">
          <span className={`status-indicator ${getStatusClass(npc?.humor)}`}></span>
          {getStatusText(npc?.humor)}
        </div>
        <div className="energy-bar">
          <div className="energy-fill" style={{ width: `${npc?.energia}%` }}></div>
        </div>
      </div>

      <div className="room-footer">
        <div className="room-meta">
          Lvl {npc?.nivel} • {npc?.experiencia} XP
        </div>
        <button className="room-btn" onClick={onEnter}>Entrar</button>
      </div>
    </div>
  )
}

function getNPCEmoji(npc_id) {
  const emojis = {
    'juan': '👨‍💼',
    'sofia': '👩‍🎨',
    'carlos': '👨‍💻',
    'lucia': '👩‍✍️',
    'marco': '🕵️',
    'ana': '👩‍🔬'
  }
  return emojis[npc_id]
}

function getStatusClass(humor) {
  return {
    'feliz': 'working',
    'neutral': 'resting',
    'cansado': 'tired'
  }[humor] || 'neutral'
}

function getStatusText(humor) {
  return {
    'feliz': 'Feliz',
    'neutral': 'Neutral',
    'cansado': 'Cansado'
  }[humor] || 'Desconocido'
}
```

### 3.2 Actualizar App Layout

**`app/app/page.jsx`** (Modificar)

```javascript
'use client'

import { useState } from 'react'
import GameHubPane from '@/components/GameHubPane'
import BrandBrainPane from '@/components/panes/BrandBrainPane.v3'
import GeneratorPane from '@/components/panes/GeneratorPane'
// ... otros panes

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('game-hub')

  return (
    <div className="app">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="content">
        {activeTab === 'game-hub' && <GameHubPane />}
        {activeTab === 'brain' && <BrandBrainPane />}
        {activeTab === 'generator' && <GeneratorPane />}
        {/* ... */}
      </div>
    </div>
  )
}
```

---

## FASE 4: INTEGRACIÓN CON TAREAS (2 días)

### 4.1 Task Completion Handler

Modificar cada pane para que al completar una tarea llame a `/api/game/complete-task`:

**`components/panes/BrandBrainPane.v3.jsx`** (Modificado)

```javascript
const handleSaveAndComplete = async () => {
  // Guardar el Brand Brain
  localStorage.setItem('brand_brain', JSON.stringify(brain))

  // Llamar API de completar tarea
  const res = await fetch('/api/game/complete-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      habitacion: 'Brain Room',
      tarea_id: 'crear_brand_profile',
      tiempo_invertido: 15 // ejemplo
    })
  })

  const result = await res.json()

  // Mostrar feedback
  toast(`+$${result.dinero_ganado} 💰 +${result.xp_ganado} ⭐`)

  // Actualizar estado global
  updateGameState(result)
}
```

---

## FASE 5: TESTING & POLISH (2 días)

### 5.1 Testing Checklist

- [ ] Crear usuario y verificar inicialización de NPCs
- [ ] Completar tarea y verificar dinero/XP
- [ ] Comprar item en tienda
- [ ] Equipar item a NPC
- [ ] Verificar que aparezca en preview
- [ ] Desbloquear logro
- [ ] Verificar niveles suben
- [ ] Respuesta de energía de NPCs

### 5.2 Performance Optimizations

- Lazy load de modals
- Memoize game state
- Optimizar queries
- Cache de items tienda

---

## FASE 6: DESPLIEGUE (1 día)

### 6.1 Deploy a Vercel

```bash
# Crear variables de entorno
ANTHROPIC_API_KEY=xxx
MYSQL_HOST=xxx
MYSQL_USER=xxx
MYSQL_PASSWORD=xxx
MYSQL_DATABASE=custer_ai_studio

# Push a GitHub
git add -A
git commit -m "feat: add game system with house hub and NPCs"
git push origin main

# Vercel se actualiza automáticamente
```

### 6.2 Ejecutar Migrations

```bash
# En la BD del servidor
mysql < DATABASE_MIGRATION.sql
```

---

## ARCHIVOS A CREAR/MODIFICAR

### Nuevos Archivos

```
app/api/game/
  ├── init/route.js
  ├── state/route.js
  ├── complete-task/route.js
  └── achievements/route.js

app/api/shop/
  ├── items/route.js
  └── buy-item/route.js

app/api/npc/
  ├── equip-item/route.js
  └── stats/route.js

components/
  ├── GameHubPane.jsx
  ├── RoomCard.jsx
  ├── GameHub.css
  └── modals/
      ├── ShopModal.jsx
      ├── ProgressModal.jsx
      ├── AchievementsModal.jsx
      └── TeamModal.jsx
```

### Modificados

```
app/app/page.jsx (integrar GameHub como tab principal)
app/globals.css (agregar estilos para GameHub)
components/Navigation.jsx (agregar tab "Casa")
lib/db.js (sin cambios, pero revisar índices)
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Semana 1
- [ ] DB setup y migrations
- [ ] APIs básicas implementadas
- [ ] Testing de APIs con Postman

### Semana 2
- [ ] Componentes React creados
- [ ] Integración con tareas
- [ ] Modals implementados

### Semana 3
- [ ] Testing end-to-end
- [ ] Refinamiento visual
- [ ] Deploy a Vercel

---

## CRITERIOS DE ÉXITO

✅ Usuario puede loguearse y ver su casa
✅ Cada habitación muestra su NPC
✅ Completar tarea → dinero + XP
✅ Comprar item en tienda
✅ Equipar item → se ve en NPC
✅ Desbloquear logro al completar tareas
✅ Dinero persiste en base de datos
✅ Responsive en mobile
✅ Carga rápida
✅ Sin errores en consola

---

## PRÓXIMOS PASOS (Post-MVP)

1. **Habilidades especiales por NPC**
2. **Daily Quests**
3. **Leaderboard global**
4. **Eventos semanales**
5. **Minigames por habitación**
6. **Sistema de amigos**
7. **Multiplayer casa visitable**
