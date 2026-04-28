# Deploy — Custer AI Studio

> **Última actualización:** 2026-04-28

---

## Estado actual

- **Plataforma:** Vercel (en evaluación migración a Railway)
- **URL producción:** https://custeraistudio.vercel.app
- **Build time:** ~47 segundos
- **Config:** `vercel.ts` en raíz del proyecto

---

## Por qué Railway

Railway tiene ventajas sobre Vercel para este proyecto:

| Item | Vercel | Railway |
|---|---|---|
| **MySQL nativo** | ❌ No (necesita servicio externo) | ✅ Sí, integrado |
| **Archivos en disco** | ❌ Serverless (sin persistencia) | ✅ Sí (el `/cerebro` puede vivir ahí) |
| **Procesos largos** | ⚠️ Límite de timeout | ✅ Sin límite |
| **Costo predecible** | ⚠️ Por invocación | ✅ Por uso de recursos |
| **Logs en tiempo real** | ⚠️ Limitado | ✅ Completo |

Railway permite que la carpeta `/cerebro` (vault sincronizado) sea accesible en disco en el servidor, lo que simplifica la lectura de archivos Markdown en cada request.

---

## Variables de Entorno a Configurar

```bash
# IA
ANTHROPIC_API_KEY=sk-ant-...

# Base de datos (Railway provee estas si usás su MySQL)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

# Auth
SESSION_SECRET=un_string_largo_y_random

# Scraping
FIRECRAWL_API_KEY=
```

---

## Checklist de Deploy

### Pre-deploy
- [ ] Variables de entorno configuradas en Railway
- [ ] MySQL inicializado (`POST /api/setup`)
- [ ] Carpeta `/cerebro` presente y con contenido del vault
- [ ] `ANTHROPIC_API_KEY` válida

### Deploy
```bash
# Railway detecta Next.js automáticamente
# Solo conectar el repo de GitHub y Railway lo buildea
railway up
```

### Post-deploy
- [ ] Verificar `/api/health` devuelve 200
- [ ] Login con demo/1234 funciona
- [ ] Crear una marca de prueba y verificar Brand Brain
- [ ] Generar un contenido de prueba y verificar Claude responde
- [ ] Verificar que `/cerebro` es accesible desde los endpoints

---

## Notas de Migración Vercel → Railway

1. **El `vercel.ts`** puede adaptarse a una config estándar de Next.js
2. **Las API Routes** son compatibles — Next.js corre igual en Railway
3. **MySQL** ya está en un servicio externo, Railway puede apuntarse a ese mismo o se migra la DB
4. **El `/cerebro`** folder es el principal beneficio: en Railway vive en disco, en Vercel habría que usar un servicio de storage externo (Vercel Blob o S3)
