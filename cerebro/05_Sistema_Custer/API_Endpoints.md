# API Endpoints — Custer AI Studio

> **Total:** 32 endpoints activos
> **Base URL producción:** https://custeraistudio.vercel.app/api
> **Última actualización:** 2026-04-28

---

## Autenticación

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/auth/login` | Login con bcrypt, setea cookie HTTPOnly |
| GET | `/api/auth/me` | Devuelve el usuario actual de la sesión |
| POST | `/api/auth/logout` | Destruye la sesión |

---

## Marcas (Brand Brain)

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/brands` | Lista todas las marcas del usuario |
| POST | `/api/brands` | Crea una nueva marca |
| GET | `/api/brands/[id]` | Obtiene el Brand Brain completo de una marca |
| PUT | `/api/brands/[id]` | Actualiza campos del Brand Brain |
| DELETE | `/api/brands/[id]` | Elimina una marca |

---

## Auto-Población de Marca

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/auto-populate-brand` | Orquestador principal — analiza imágenes + IG + web + texto y puebla el Brand Brain |
| POST | `/api/analyze-visual-assets` | Claude Vision analiza imágenes: colores, tipografía |
| POST | `/api/analyze-visual-identity` | Análisis profundo de identidad visual |
| POST | `/api/scrape-instagram` | Extrae datos públicos de Instagram (followers, engagement) |
| POST | `/api/scrape-website` | Scraping de website: CSS, fuentes, contenido |
| POST | `/api/scrape-brand-url` | Análisis de URL específica de marca |
| POST | `/api/process-brand-text` | Claude extrae datos estructurados desde texto libre |

---

## Generación de Contenido

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/generate` | Genera HTML/CSS mockup + copy basado en Brand Brain + brief |
| POST | `/api/copy` | Genera variaciones de copy para distintas plataformas |
| POST | `/api/validate` | Valida un copy o pieza contra la identidad de marca |
| POST | `/api/validate-simple` | Validación rápida (versión liviana) |
| POST | `/api/competition` | Análisis competitivo basado en el Brand Brain |

---

## Conversaciones

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/conversations` | Lista conversaciones del usuario |
| POST | `/api/conversations` | Guarda una nueva conversación |
| GET | `/api/conversations/[id]` | Obtiene una conversación completa con historial |

---

## Sistema

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/health` | Health check + estado de variables de entorno |
| POST | `/api/setup` | Inicializa el schema de la base de datos |
| GET | `/api/assistant-context` | Construye y devuelve el contexto actual para el agente |

---

## Notas de Implementación

- **Modelo principal:** Claude 3.5 Haiku (`claude-3-5-haiku-20241022`) — optimizado para velocidad y costo
- **Modelo visión:** Claude Vision para análisis de imágenes
- **Token tracking:** Cada llamada registra tokens en `.claude/token-metrics.json`
- **Autenticación:** Todos los endpoints requieren cookie de sesión válida excepto `/api/auth/login` y `/api/health`
- **Multi-tenancy:** Todos los queries filtran por `user_id` de la sesión activa
