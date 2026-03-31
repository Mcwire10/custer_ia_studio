# 🏠 CUSTER AGENCY - Game Design Document (GDD)

## Vision

Transformar la experiencia de usar una herramienta de IA en un **juego de gestión de agencia con mecánicas Pokémon-style**. El usuario gestiona una casa/agencia donde NPCs trabajan en diferentes tareas (panes), completa misiones, gana dinero y compra items/ropa para personalizar su agencia.

---

## 1. CORE MECHANICS

### 1.1 Casa/Agencia como Hub Central
```
LOGIN → CASA (Hub) → HABITACIONES (Panes)
                  ↓
            TIENDA
            PROGRESO
            PERSONAJES
```

Cada vez que el usuario inicia sesión:
- Ve su casa con los NPCs trabajando
- Puede entrar a cada habitación (pestaña) o comprar items
- Los NPCs tienen estado (Trabajando, Descansando, Feliz, Cansado)

### 1.2 Las 6 Habitaciones

| Habitación | Función | NPC Ejemplo | Tarea |
|-----------|---------|-----------|-------|
| **🧠 Brain Room** | Brand Brain | Juan | Crear perfiles de marca |
| **🎨 Generator Room** | Carousel Gen | Sofia | Generar carruseles |
| **✅ Validator Room** | Validación | Carlos | Validar contenido |
| **📝 Copy Room** | Copy Generation | Lucia | Escribir copys |
| **🔍 Competition Room** | Análisis | Marco | Analizar competencia |
| **📊 Reports Room** | Reportes | Ana | Generar reportes |

### 1.3 Tareas = Misiones

Cada tarea completada en una habitación:
- ✅ Da **experiencia al NPC**
- 💰 Da **dinero al jugador** (dinero game, no real)
- 📈 Sube **nivel de la agencia**
- 🎖️ Desbloquea **logros**

**Ejemplo:**
```
Usuario completa: "Crear Brand Profile"
  ↓
+$50 dinero game
+10 XP al NPC (Juan)
Juan sube de Level 2 → Level 3
Desbloquea: "Logro: Brand Architect"
```

### 1.4 Sistema de Dinero Game

**Ganancia:**
- Tarea pequeña (5 min): $25-50
- Tarea mediana (15 min): $50-150
- Tarea grande (30+ min): $150-500

**Gastos:**
- Ropa común: $30-100
- Ropa rara: $200-500
- Ropa épica: $500-1500
- Items decorativos: $50-200

---

## 2. PERSONAJES (NPCs)

### 2.1 Estructura de NPC

Cada NPC tiene:
```javascript
{
  id: "juan",
  nombre: "Juan",
  rol: "Brand Specialist",
  habitacion: "Brain Room",
  nivel: 3,
  experiencia: 450,
  humor: "feliz" | "neutral" | "cansado",
  energia: 75,

  // Customización
  ropa: {
    cabeza: "gorro_de_chef",
    cuerpo: "hoodie_morada",
    pies: "tenis_oro"
  },
  avatar: "sprite_juan_v1",

  // Progreso
  tareas_completadas: 23,
  dinero_generado: 2450
}
```

### 2.2 Estados del NPC

```
TRABAJANDO 🔴 (activo en la tarea actual)
  ↓ (al completar tarea)
DESCANSANDO 😴 (regenerando energía)
  ↓ (después de X minutos)
FELIZ 😊 (listo para otra tarea)
CANSADO 😫 (energía baja, velocidad reducida)
```

### 2.3 Skins/Ropa

**Por categoría:**
- 👕 Cuerpo (20+ opciones)
- 🎩 Cabeza (15+ opciones)
- 👟 Pies (12+ opciones)
- 💍 Accesorios (10+ opciones)

**Rareza:**
```
⚪ Común (Free con XP)
🟦 Raro ($200)
🟪 Épico ($500+)
🟨 Legendario ($1500+, tareas especiales)
```

**Ejemplo de items:**
- Hoodie morada (primario de Custer)
- Gorro de chefa (para Sofia)
- Lentes gamer (para Carlos)
- Auriculares premium (para Lucia)
- Gafas de sol (para Marco)
- Bata de científica (para Ana)

---

## 3. PROGRESIÓN DEL JUGADOR

### 3.1 Niveles de la Agencia

```
Nivel 1 (Startup) → Nivel 10 (Agency) → Nivel 20 (Studio) → Nivel 30 (Empire)
```

Cada nivel requiere X experiencia total, desbloquea:
- Nuevas habitaciones
- Nuevos NPCs
- Cosméticos exclusivos
- Bonificadores (dinero +10%, XP +15%)

### 3.2 Logros / Achievements

```
🏅 "Primer Diagnóstico" - Completar 1 Brand Brain
🏅 "Generador Loco" - Generar 10 carruseles
🏅 "Validador Pro" - Validar 50 mensajes
🏅 "Copywiter Experto" - Generar 100 copys
🏅 "Observador" - Analizar 5 competencias
🏅 "Reportero" - Generar 20 reportes
🏅 "Entrepreneur" - Ganar $5000
🏅 "Fashion Icon" - Comprar 20 items
🏅 "Dream Team" - Subir todos los NPCs a Nivel 5
🏅 "Leyenda" - Completar todas las tareas
```

### 3.3 Habilidades Especiales (Futura)

Cada NPC desbloquea habilidades al Level 5+:
- **Juan (Brain)**: "Insight Boost" → +25% calidad en perfiles
- **Sofia (Generator)**: "Speed Run" → Generar 2x más rápido
- **Carlos (Validator)**: "Detective Mode" → Detecta errores automáticos
- **Lucia (Copy)**: "Persuasion" → Copys con +50% engagement
- **Marco (Competition)**: "Market Scanner" → Análisis más profundo
- **Ana (Reports)**: "Data Wizard" → Reportes con predicciones

---

## 4. TIENDA (Shop System)

### 4.1 Estructura

```
┌─────────────────────────────────┐
│ 🛍️ TIENDA - Tu dinero: $450     │
├─────────────────────────────────┤
│ 👕 Ropa                         │
│ 🏠 Decoración Hogar             │
│ 🎨 Temas (próximamente)         │
│ ⚡ Power-ups (próximamente)     │
└─────────────────────────────────┘
```

### 4.2 Categorías

**Ropa (Visible en NPC)**
- Cada item es wearable por cualquier NPC
- Vista previa antes de comprar
- Efecto cosmético SOLO (sin stat boost)

**Decoración (En casa)**
- Lámparas, plantas, cuadros
- Personaliza la apariencia de cada habitación
- Comprados una sola vez, bonificador permanente

**Power-ups (Futura)**
- Doble XP por 1 hora
- Dinero +50% por 30 min
- Energía infinita por 15 min

---

## 5. FLUJO DE USUARIO

### 5.1 Primera Vez (Onboarding)

```
1. LOGIN 3D
   ↓
2. TUTORIAL en casa
   "Bienvenido a tu agencia"
   - Click en habitación
   - Completa 1 tarea (Brand Brain simple)
   - Gana dinero
   - Abre tienda
   ↓
3. CASA (Hub)
   - Ve 6 habitaciones
   - Ve su NPC (Juan) trabajando
   ↓
4. COMPLETAR TAREA
   - Entra a Brand Brain Room
   - Juan está trabajando
   - Completa la tarea
   ↓
5. RECOMPENSA
   +$50 💰
   Juan: Nivel 1 → Nivel 2
   ↓
6. TIENDA
   Ve item disponible
   Compra hoodie morada
   Juan se la pone ✨
```

### 5.2 Sesión Normal

```
LOGIN 3D → CASA (Hub)
  ├─ Ver NPCs + su estado
  ├─ Ver dinero total
  ├─ Elegir habitación
  │  ├─ Entrar a una
  │  ├─ Completar tarea
  │  ├─ Ganar dinero
  │  └─ Volver a casa
  ├─ TIENDA
  │  ├─ Ver items
  │  ├─ Comprar ropa/items
  │  └─ Ver equipo en NPCs
  ├─ PROGRESO
  │  ├─ Ver nivel agencia
  │  ├─ Ver logros
  │  ├─ Ver stats NPCs
  │  └─ Ver histórico dinero
  └─ LOGOUT
```

### 5.3 Daily/Weekly Quests (Futura)

```
DIARIA (Reseta cada 24h):
  "Completar 2 tareas" → +$100
  "Comprar 1 item" → +1 Achievement
  "Entrar a 3 habitaciones" → +50 XP

SEMANAL (Reseta cada 7 días):
  "Ganar $500 total" → Desbloquea item raro
  "Subir 1 NPC de nivel" → Skin especial
  "Completar todas las tareas" → Recompensa épica
```

---

## 6. BASE DE DATOS

### 6.1 Nuevas Tablas (Extensión)

```sql
-- Usuarios extendidos
ALTER TABLE users ADD COLUMN (
  dinero_game INT DEFAULT 0,
  nivel_agencia INT DEFAULT 1,
  xp_total INT DEFAULT 0,
  fecha_ultimo_login TIMESTAMP
);

-- NPCs
CREATE TABLE npcs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  npc_id VARCHAR(50),
  nombre VARCHAR(100),
  rol VARCHAR(100),
  habitacion VARCHAR(50),
  nivel INT DEFAULT 1,
  experiencia INT DEFAULT 0,
  energia INT DEFAULT 100,
  humor ENUM('feliz', 'neutral', 'cansado'),
  tareas_completadas INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inventario (ropa/items)
CREATE TABLE inventario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  item_id VARCHAR(100),
  item_tipo ENUM('ropa', 'decoracion', 'power-up'),
  cantidad INT DEFAULT 1,
  npc_equipado VARCHAR(50), -- Qué NPC lo está usando
  fecha_compra TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Equipo actual (qué ropa tiene cada NPC)
CREATE TABLE npc_equipo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  npc_id INT,
  slot ENUM('cabeza', 'cuerpo', 'pies', 'accesorios'),
  item_id VARCHAR(100),
  FOREIGN KEY (npc_id) REFERENCES npcs(id)
);

-- Logros
CREATE TABLE logros (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  logro_id VARCHAR(100),
  nombre VARCHAR(150),
  descripcion TEXT,
  desbloqueado_en TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, logro_id)
);

-- Transacciones dinero
CREATE TABLE transacciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  tipo ENUM('ganancia', 'gasto'),
  monto INT,
  concepto VARCHAR(200),
  habitacion VARCHAR(50),
  fecha TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 7. ARQUITECTURA FRONTEND

### 7.1 Estructura de Componentes

```
App/
├─ LoginPane 3D (existe)
├─ HouseHub (NUEVO)
│  ├─ RoomCard (cada habitación)
│  ├─ NPCDisplay (personaje)
│  ├─ MoneyBar (dinero visible)
│  └─ ShopButton
├─ RoomComponent (ADAPTADO)
│  ├─ NPCWorking (animación)
│  ├─ TaskInterface
│  ├─ TaskCompletion (da dinero)
│  └─ BackToHouse
├─ ShopPane (NUEVO)
│  ├─ ItemGrid
│  ├─ ItemPreview
│  ├─ BuyButton
│  └─ Inventory
├─ ProgressPane (NUEVO)
│  ├─ AgencyLevel
│  ├─ AchievementsList
│  ├─ NPCStats
│  └─ MoneyChart
└─ NPCCustomization (NUEVO)
   ├─ RopaSelector
   ├─ PreviewNPC
   └─ EquipoActual
```

### 7.2 Estados

```javascript
// Global Game State
{
  usuario: { id, dinero_game, nivel_agencia, xp_total },
  npcs: [
    { id: "juan", nivel: 3, energia: 75, equipo: {...} },
    { id: "sofia", nivel: 2, energia: 50, equipo: {...} },
    // ... etc
  ],
  inventario: [
    { item_id: "hoodie_morada", cantidad: 1, equipado: "juan" },
    { item_id: "gafas_sol", cantidad: 1, equipado: null },
    // ... etc
  ],
  logros: ["primer_diagnostico", "generador_loco"],
  transacciones: [
    { tipo: "ganancia", monto: 50, concepto: "Brand Brain completado" },
  ]
}
```

---

## 8. API ENDPOINTS (NUEVOS)

### 8.1 Game System

```
POST /api/game/init
  Inicializa el juego para un usuario (primera vez)
  Response: { npcs, dinero, nivel }

GET /api/game/state
  Obtiene estado completo del juego
  Response: { usuario, npcs, inventario, logros }

POST /api/game/complete-task
  Marca una tarea como completada
  Body: { habitacion, tarea_id }
  Response: { dinero_ganado, xp, nivel_up?, logro? }

POST /api/shop/buy-item
  Compra un item
  Body: { item_id }
  Response: { dinero_restante, inventario }

POST /api/npc/equip-item
  Equipa un item a un NPC
  Body: { npc_id, item_id, slot }
  Response: { npc_actualizado }

GET /api/achievements
  Lista todos los logros y sus estados
  Response: { logros }

GET /api/leaderboard
  Ranking de agencias (futura)
  Response: { usuarios, ranking }
```

---

## 9. TIMELINE IMPLEMENTACIÓN

### Phase 1 (MVP - 2 semanas)
- ✅ Login 3D (existe)
- ✅ Brand Brain v3 (existe)
- 🔲 HouseHub (6 habitaciones)
- 🔲 NPCs básicos (sin customización)
- 🔲 Sistema dinero simple
- 🔲 Tienda básica (5-10 items)

### Phase 2 (Game Enhancement - 1 semana)
- 🔲 Customización NPCs (ropa)
- 🔲 Sistema de niveles
- 🔲 Logros
- 🔲 Stats/Progreso

### Phase 3 (Polish - 1 semana)
- 🔲 Animaciones NPCs trabajando
- 🔲 Sonidos
- 🔲 Efectos visuales
- 🔲 Leaderboard

### Phase 4 (Advanced - Futura)
- 🔲 Daily quests
- 🔲 Habilidades especiales
- 🔲 Modo multijugador
- 🔲 Seasonal pass

---

## 10. VISUAL REFERENCES

### 10.1 Casa Pokémon Inspiración

```
Inspiración: Pokémon Mystery Dungeon / Pokémon Sword & Shield
- Isometric view (vista 3D en ángulo)
- Habitaciones interconectadas
- NPCs andando/trabajando
- Decoración personalizable
- Música ambiental relajante
```

### 10.2 Estilo Visual

```
- Same as Brand Brain v3 (colores primario/accent)
- Sprites 2D estilo Pokémon (caricaturescos)
- Fondo 3D de partículas (mantener)
- Glassmorphism panels
- Animaciones fluidas y playful
```

---

## 11. ECONOMY BALANCING

### 11.1 Dinero Balance

**Ganancias:**
```
Brand Brain pequeño     → $25-50
Generator pequeño       → $30-60
Validator pequeño       → $20-40
Copy pequeño            → $40-70
Competition pequeño     → $50-80
Reports pequeño         → $60-100

(En promedio: ~$50 por tarea = ~$300/día si completa 6)
```

**Costos:**
```
Item común              → $30-100 (1-2 días)
Item raro              → $200-500 (4-10 días)
Item épico             → $500-1500 (10-30 días)
Decoración hogar       → $100-300 (2-6 días)
```

**Objetivo:** El usuario debe poder comprar algo cada 1-2 días para sensación de progreso.

---

## 12. DOCUMENTACIÓN DE DISEÑO

### 12.1 Personas Jugables

```
Juan - Brand Specialist
├─ Rol: Crea perfiles
├─ Hobby: Leer libros
├─ Ropa favorita: Blazer, lentes

Sofia - Creative Lead
├─ Rol: Genera contenido visual
├─ Hobby: Dibujar
├─ Ropa favorita: Hoodie, boinas

Carlos - Data Analyst
├─ Rol: Valida información
├─ Hobby: Jugar videojuegos
├─ Ropa favorita: Gamer gear

Lucia - Copywriter
├─ Rol: Escribe textos
├─ Hobby: Escribir poesía
├─ Ropa favorita: Estilo casual chic

Marco - Market Researcher
├─ Rol: Analiza competencia
├─ Hobby: Investigar
├─ Ropa favorita: Casual inteligente

Ana - Data Scientist
├─ Rol: Genera reportes
├─ Hobby: Trabajar con datos
├─ Ropa favorita: Profesional futurista
```

### 12.2 Items Especiales

```
LEGENDARIOS:
- "Traje de CEO" ($1500) - Desbloqueable al Level 20
- "Jersey Premium Custer" ($2000) - Solo ganando 10 logros
- "Auriculares Mágicos" ($1800) - Quest especial

ÉPICOS:
- Hoodie morada Custer ($500)
- Lentes gamer RGB ($600)
- Zapatillas premium ($550)
- Sombrero de chefa ($450)
- Gafas de sol retro ($480)

RAROS:
- Cualquier variación de color/estilo ($200-300)

COMUNES:
- Ropa básica gratis (obtenida en sesiones)
- T-shirts simples
- Jeans
```

---

## 13. PRÓXIMAS FASES (Visión Futura)

### 13.1 Multiplayer

```
- Ver agencias de otros usuarios
- Comparar estilos/equipos
- Leaderboard global
- Gifting de items
```

### 13.2 Eventos Especiales

```
- Eventos semanales (Halloween, Navidad)
- Items limitados
- Desafíos con premios especiales
- Colaboraciones
```

### 13.3 Minigames

```
- Cada habitación tiene un "minijuego" opcional
- Ganar más dinero si vences el minijuego
- Leaderboard individual por habitación
```

### 13.4 Narrative/Story

```
- NPCs tienen historias personales
- Diálogos dinámicos
- Relaciones entre NPCs
- Quest line narrativa
```

---

## CONCLUSIÓN

Este sistema transforma **una herramienta de IA mundana en un juego adictivo y progresivo**. El usuario sigue usando todas las features (Brand Brain, Generator, etc.), pero ahora:

✅ Tiene **propósito** (mejorar su agencia)
✅ Ve **progreso** (dinero, niveles, items)
✅ Siente **conexión** (con sus NPCs)
✅ Experimenta **recompensas** (compras, logros)
✅ Quiere **volver** mañana (daily rewards)

**Monetización futura:** Premium Battle Pass ($4.99/mes) con items exclusivos, sin pay-to-win.

---

*Versión 1.0 - Marzo 2026*
*Documento Living - Se actualiza con iteraciones*
