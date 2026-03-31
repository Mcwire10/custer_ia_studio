# 🔐 Setup del Login y Base de Datos

## 📋 Configuración Paso a Paso

### 1️⃣ Crear Base de Datos en MySQL

```bash
# Conectar a MySQL
mysql -u root -p

# Crear database
CREATE DATABASE custer_ia_studio;
USE custer_ia_studio;

# Ejecutar el script SQL
source DATABASE_SETUP.sql
```

**O usando archivo SQL:**
```bash
mysql -u root -p custer_ia_studio < DATABASE_SETUP.sql
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env.local
```

**Editar `.env.local`:**
```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu-contraseña
DB_NAME=custer_ia_studio
```

### 3️⃣ Instalar Dependencias

```bash
npm install
```

### 4️⃣ Correr en Desarrollo

```bash
npm run dev
```

Abre: http://localhost:3000/login

---

## 🔑 Usuarios Demo

Después de ejecutar `DATABASE_SETUP.sql`, tienes estos usuarios:

| Usuario | Contraseña | Email |
|---------|------------|-------|
| `demo` | `1234` | demo@example.com |
| `admin` | `5678` | admin@example.com |
| `user` | `9999` | user@example.com |

**Para crear más usuarios:**

```sql
INSERT INTO users (username, password, email) VALUES
('newuser', '1111', 'new@example.com');
```

---

## 📊 Estructura de Tablas

### Tabla `users`
```
id           INT (Primary Key)
username     VARCHAR(50) UNIQUE
password     VARCHAR(4)      -- 4 dígitos
email        VARCHAR(100)
created_at   TIMESTAMP
active       BOOLEAN
```

### Tabla `logs` (historial de actividad)
```
id           INT (Primary Key)
user_id      INT (Foreign Key)
action       VARCHAR(50)     -- 'generate', 'validate', 'login', etc
details      JSON            -- datos adicionales
result       VARCHAR(20)     -- 'success', 'error'
created_at   TIMESTAMP
```

### Tabla `projects` (para guardar trabajos)
```
id           INT (Primary Key)
user_id      INT (Foreign Key)
name         VARCHAR(100)
brain        JSON            -- Brand Brain guardado
carousel     JSON            -- Carousel generado
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

---

## 🔄 Flujo del Login

```
USUARIO
  ↓
ENTRA A: http://localhost:3000/login
  ↓
VE PANTALLA DE LOGIN
  ↓
INGRESA: demo + 1234
  ↓
POST /api/auth/login
  ├─ Valida en tabla `users`
  ├─ Crea cookie de sesión
  ├─ Registra login en tabla `logs`
  └─ Redirige a /app
  ↓
DENTRO DE /app
  ├─ Todas las acciones se registran en `logs`
  │  • generate → carousel creado
  │  • validate → mensaje validado
  │  • copy → textos generados
  │  • etc
  ↓
LOGOUT
  ├─ POST /api/auth/logout
  ├─ Borra cookies
  ├─ Registra logout en logs
  └─ Redirige a /login
```

---

## 📊 Ver Logs del Usuario

```sql
-- Todos los logs de un usuario
SELECT u.username, l.action, l.result, l.created_at
FROM logs l
JOIN users u ON l.user_id = u.id
WHERE u.username = 'demo'
ORDER BY l.created_at DESC;

-- Últimos 20 logs
SELECT u.username, l.action, l.result, l.created_at
FROM logs l
JOIN users u ON l.user_id = u.id
ORDER BY l.created_at DESC
LIMIT 20;

-- Logs por acción
SELECT action, COUNT(*) as count, MAX(created_at) as last_time
FROM logs
GROUP BY action
ORDER BY last_time DESC;
```

---

## 🔐 Seguridad

✅ **Contraseñas:** Simple (4 dígitos) para demo. En producción considerar hash.
✅ **Sesiones:** Via cookies HTTP-only
✅ **Middleware:** Protege rutas /app
✅ **Logs:** Registra todas las acciones

---

## 🚀 En Producción (Vercel)

### Variables de Entorno en Vercel:

```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxxxxxxx
DB_HOST = tu-servidor-mysql.com
DB_USER = usuario-remoto
DB_PASSWORD = contraseña
DB_NAME = custer_ia_studio
```

### Base de Datos:

Usar un MySQL remoto (ej: AWS RDS, DigitalOcean, etc)

```bash
# Conectarse al remoto
mysql -h tu-servidor.com -u usuario -p custer_ia_studio < DATABASE_SETUP.sql
```

---

## ❓ Troubleshooting

### Error: "ECONNREFUSED" (No conecta a MySQL)

```
Solución:
1. Verificar que MySQL está corriendo: mysql -u root
2. Verificar DB_HOST en .env.local
3. Verificar credenciales (user, password)
```

### Error: "Unknown database"

```
Solución:
1. Crear database: CREATE DATABASE custer_ia_studio;
2. Ejecutar script SQL: source DATABASE_SETUP.sql
```

### Error: "Table doesn't exist"

```
Solución:
1. Verificar que ejecutaste DATABASE_SETUP.sql
2. Checkear: SHOW TABLES;
```

---

¡Listo! Tu sistema de login está funcionando. 🔐
