# 📤 Cómo Pushear a GitHub

## Paso 1: Ir a la carpeta del proyecto

```bash
cd /Users/leandromoyano/agentes/custer_ai_studio
```

## Paso 2: Inicializar Git (si no está inicializado)

```bash
git init
git config user.name "Tu Nombre"
git config user.email "tu-email@example.com"
```

## Paso 3: Agregar todos los archivos

```bash
git add .
```

## Paso 4: Hacer el commit inicial

```bash
git commit -m "Initial commit: Custer IA Studio - Next.js + React"
```

## Paso 5: Conectar con tu repositorio en GitHub

**Importante:** Reemplaza `tu-usuario` con tu usuario de GitHub.

```bash
git remote add origin https://github.com/tu-usuario/custer_ai_studio.git
```

## Paso 6: Cambiar rama a main (si es necesario)

```bash
git branch -M main
```

## Paso 7: Pushear el código

```bash
git push -u origin main
```

---

## ✅ Verificar que funcionó

1. Ve a: https://github.com/tu-usuario/custer_ai_studio
2. Deberías ver todos los archivos

---

## 🚀 Siguiente: Conectar con Vercel

Una vez que el código está en GitHub:

1. Ve a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Busca "custer_ai_studio" (debe aparecer de tus repos privados)
4. Click "Import"
5. En "Environment Variables" agrega:
   ```
   ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxxxxxxx
   ```
6. Click "Deploy"

¡Listo! Tu app estará en vivo en unos minutos. 🎉

---

## 💡 Próximas veces que hagas cambios:

```bash
# Editar código...

git add .
git commit -m "Descripción del cambio"
git push
```

Vercel hace deploy automático cuando pusheás a main.

---

¿Dudas? Preguntame. 🚀
