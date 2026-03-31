# 🔄 Flujo de Login y Logging

## FLUJO VISUAL COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO ABRE NAVEGADOR                    │
│                   http://localhost:3000                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                    ↓ (No tiene cookie)                       │
│                                                               │
│               MIDDLEWARE: ¿Tiene user_id?                    │
│                    NO → Redirige a /login                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PANTALLA DE LOGIN                          │
│                 (app/login/page.jsx)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────┐                    │
│  │        Custer IA Studio 2025         │                    │
│  │                                       │                    │
│  │  Usuario:  [ demo     ]              │                    │
│  │  Contraseña: [ 1234    ] (4 dígitos) │                    │
│  │                                       │                    │
│  │          [✦ Ingresar]                │                    │
│  │                                       │                    │
│  │  📌 Demo                             │                    │
│  │     demo / 1234                      │                    │
│  │     admin / 5678                     │                    │
│  └──────────────────────────────────────┘                    │
│                                                               │
│              Usuario ingresa credenciales                    │
│                                                               │
│                  ↓ Click [Ingresar]                          │
│                                                               │
│              POST /api/auth/login                            │
│              { username, password }                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (API de LOGIN)                      │
│            (app/api/auth/login/route.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Validar input                                            │
│     • ¿username existe?                                      │
│     • ¿password es 4 dígitos?                                │
│                                                               │
│  2. Buscar en BD                                             │
│     SELECT * FROM users                                      │
│     WHERE username = 'demo' AND password = '1234'            │
│     AND active = TRUE                                        │
│                                                               │
│  3. Si NO existe → return error                              │
│     ❌ "Usuario o contraseña incorrectos"                    │
│                                                               │
│  4. Si SÍ existe → Crear sesión                              │
│     • Guardar user_id en cookie                              │
│     • Guardar session_token en cookie                        │
│                                                               │
│  5. Registrar login en BD (LOG)                              │
│     INSERT INTO logs                                         │
│     (user_id, action, result, created_at)                    │
│     VALUES (1, 'login', 'success', NOW())                    │
│                                                               │
│  6. Devolver respuesta                                       │
│     { success: true, user: {id, username, email} }           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (LOGIN EXITOSO)                    │
│                (app/login/page.jsx)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Recibe respuesta con:                                       │
│  • success: true                                             │
│  • user: { id: 1, username: "demo" }                         │
│                                                               │
│  ✓ Navegador guarda cookies:                                 │
│    - user_id = 1                                             │
│    - session_token = (random)                                │
│                                                               │
│  Redirige a: /app                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE: Verifica                         │
│              ¿Tiene cookie user_id?                          │
│                    SÍ → Permite acceso a /app                │
│                  NO → Redirige a /login                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DENTRO DE LA APP                           │
│              (app/app/page.jsx - PROTEGIDO)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ c uster    [🧠 Brand] [✦ Gen] [🎯 Val] ...          │    │
│  │                                      👤 demo [🚪 Salir]  │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Usuario puede hacer acciones:                               │
│                                                               │
│  ✦ GENERADOR                                                 │
│  • Escribe tema: "Transformación digital"                    │
│  • Click "Generar"                                           │
│  • Backend procesa                                           │
│  • 📝 LOG registrado en BD:                                  │
│    INSERT INTO logs                                          │
│    (user_id: 1, action: "generate", result: "success")       │
│                                                               │
│  🎯 VALIDADOR                                                │
│  • Pega mensaje                                              │
│  • Click "Validar"                                           │
│  • Backend valida                                            │
│  • 📝 LOG registrado:                                        │
│    (user_id: 1, action: "validate", result: "success")       │
│                                                               │
│  ✍️ COPY                                                     │
│  • Elige plataformas                                         │
│  • Click "Generar"                                           │
│  • 📝 LOG registrado:                                        │
│    (user_id: 1, action: "copy", result: "success")           │
│                                                               │
│  🔍 COMPETENCIA                                              │
│  • Ingresa competidores                                      │
│  • Click "Analizar"                                          │
│  • 📝 LOG registrado:                                        │
│    (user_id: 1, action: "competition", result: "success")    │
│                                                               │
│  📊 REPORTES                                                 │
│  • Click "Generar Reporte"                                   │
│  • 📝 LOG registrado:                                        │
│    (user_id: 1, action: "reports", result: "success")        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  LOGOUT (Usuario clickea)                    │
│                  [🚪 Salir]                                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/auth/logout                                       │
│                                                               │
│  Backend:                                                    │
│  1. Obtiene user_id del cookie                               │
│  2. Registra logout en logs:                                 │
│     INSERT INTO logs                                         │
│     (user_id: 1, action: "logout", result: "success")        │
│  3. Borra cookies del navegador                              │
│  4. Redirige a /login                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 TABLA DE LOGS EN LA BD

Después de usar la app, la tabla `logs` se ve así:

```sql
SELECT u.username, l.action, l.result, l.created_at
FROM logs l
JOIN users u ON l.user_id = u.id
ORDER BY l.created_at DESC;
```

**Resultado:**

| username | action | result | created_at |
|----------|--------|--------|------------|
| demo | logout | success | 2025-03-30 15:45:30 |
| demo | reports | success | 2025-03-30 15:45:15 |
| demo | competition | success | 2025-03-30 15:44:50 |
| demo | copy | success | 2025-03-30 15:44:20 |
| demo | validate | success | 2025-03-30 15:43:45 |
| demo | generate | success | 2025-03-30 15:43:10 |
| demo | login | success | 2025-03-30 15:40:00 |
| admin | login | success | 2025-03-30 14:15:00 |

---

## 🔐 LO QUE ESTÁ PROTEGIDO

```
┌─────────────────────────────────────────┐
│  ✅ PROTEGIDO (Requiere login)          │
├─────────────────────────────────────────┤
│  /app                                   │
│  /app/page.jsx                          │
│                                         │
│  API privadas:                          │
│  POST /api/generate                     │
│  POST /api/validate                     │
│  POST /api/copy                         │
│  POST /api/competition                  │
│  POST /api/reports                      │
│                                         │
│  GET /api/auth/me (info del usuario)    │
│  POST /api/auth/logout                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ❌ PÚBLICO (Sin login)                 │
├─────────────────────────────────────────┤
│  /login                                 │
│  /api/auth/login                        │
│  /api/health                            │
└─────────────────────────────────────────┘
```

---

## 💾 CÓMO FUNCIONA EL LOGGING

Cada acción en la app AUTOMÁTICAMENTE:

```javascript
// En cada API route (generate, validate, copy, etc)

// 1. Procesar acción
const carousel = await generateCarousel(...)

// 2. Registrar en logs
await logActivity(
  userId,                    // Obtenido de la sesión
  'generate',               // Tipo de acción
  { topic, format },        // Detalles
  'success'                 // Resultado
)

// 3. Devolver resultado al usuario
return Response.json({ success: true, carousel })
```

---

## 📈 VER ACTIVIDAD TOTAL

```sql
-- Resumen de actividades
SELECT action, COUNT(*) as count, MAX(created_at) as last_time
FROM logs
GROUP BY action
ORDER BY last_time DESC;

-- Resultado:
action      | count | last_time
------------|-------|-------------------
generate    | 15    | 2025-03-30 15:43:10
validate    | 8     | 2025-03-30 15:43:45
copy        | 12    | 2025-03-30 15:44:20
competition | 5     | 2025-03-30 15:44:50
reports     | 3     | 2025-03-30 15:45:15
login       | 6     | 2025-03-30 15:40:00
logout      | 6     | 2025-03-30 15:45:30
```

---

## 🚀 FLUJO SIMPLE EN UNA LÍNEA

```
Login → Crea sesión → Registra en logs → Usa app → Cada acción se registra → Logout
```

**¡Simple y ligero! 🎯**
