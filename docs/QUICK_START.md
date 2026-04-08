# 🚀 Quick Start - Custer AI Studio

**⏱️ Setup en 5 minutos | Para developers nuevos**

---

## 1️⃣ Clonar & Instalar (2 min)

```bash
# Clonar repo
git clone <repo-url> custer
cd custer

# Instalar dependencias
npm install

# Crear archivo .env.local
cp .env.example .env.local
```

### Variables de Entorno Necesarias

En `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...        # Tu API key de Anthropic
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 2️⃣ Iniciar Servidor (1 min)

```bash
npm run dev
```

Abre: **http://localhost:3000/studio-v2.html**

Deberías ver la interfaz con:
- ✅ Panel de Brand Brain (izquierda)
- ✅ 7 módulos en tabs (Generador, Validador, Copy, etc)
- ✅ Chat flotante (esquina inferior derecha)

---

## 3️⃣ Primera Tarea: Crear una Marca (2 min)

1. **Ingresa a Brand Brain**
2. **Desliza a través de los 10 slides** y completa:
   - Nombre
   - Misión
   - Audiencia
   - Colores
3. **Click en "💾 Guardar/Actualizar marca"**
4. ✅ Toast verde: `✅ Marca guardada`

---

## 4️⃣ Segunda Tarea: Generar Contenido (1 min)

1. **Click en tab "✨ Generador"**
2. **Completa los campos**:
   - Tipo: Carrusel / Stories / Post único
   - Cantidad: 3-5
   - Estilo: Informativo / Impactante / Beneficios
   - Tema: "Nuevo producto lanzamiento"
3. **Click "🎨 Generar anuncios"**
4. ✅ Se generan mockups visuales

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| `ANTHROPIC_API_KEY undefined` | Verifica `.env.local` tiene la key |
| `npm: command not found` | Instala Node.js (v18+) |
| Puerto 3000 en uso | Usa `PORT=3001 npm run dev` |
| Blank page en navegador | F5 para recargar, abre console (F12) |
| API 401 Unauthorized | API key expirada, genera nueva |

---

## 📚 Próximos Pasos

- Leer [EXAMPLES.md](./EXAMPLES.md) para 3 casos reales
- Leer [WORKFLOW_DETAILED.md](./WORKFLOW_DETAILED.md) para entender proceso de desarrollo
- Leer [/tasks/todo.md](/tasks/todo.md) para ver roadmap del proyecto

---

**¿Preguntas?** Revisa [DOCUMENTATION_INDEX.md](/DOCUMENTATION_INDEX.md)
