# Sistema Técnico — Custer AI Studio

> **Rol en el ecosistema:** Motor de ejecución del Cerebro Agencia. Es donde el conocimiento estratégico del vault se convierte en contenido real.
> **URL Producción:** https://custeraistudio.vercel.app
> **Repo:** /Users/leandromoyano/agentes/custer_ai_studio
> **Última actualización:** 2026-04-28

---

## Qué es Custer AI Studio

Una aplicación web de gestión de marca y generación de contenido con IA. Funciona como el **brazo ejecutor** del Cerebro Agencia: donde el ADN de marca estratégico se convierte en piezas concretas, validadas y alineadas con la identidad de cada cliente.

---

## Relación con el Vault

```
OBSIDIAN (Cerebro Agencia)          CUSTER AI STUDIO
────────────────────────────        ────────────────────────────
02_ADN_Marcas/*.md          →       Brand Brain (58 campos, MySQL)
00_SOP_Agencia/System_Prompt →      Modo Mentor Ácido (por implementar)
01_Biblioteca_Teorica/      →       Contexto de citas en generación
03_Casos_Exito/             →       Casos documentados (futura integración)
```

---

## Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| [[Arquitectura]] | Diagrama completo del sistema y flujos |
| [[Brand_Brain_58_Campos]] | Los 58 campos del Brain y cómo mapean al ADN de marca |
| [[API_Endpoints]] | Los 32 endpoints disponibles |
| [[Stack_Tecnico]] | Tecnologías, dependencias, configuración |
| [[Deploy_Railway]] | Cómo deployar y variables de entorno requeridas |
| [[Roadmap_Cerebro_Integracion]] | Fases de integración Obsidian ↔ Custer |

---

## Estado actual del proyecto

- ✅ **Producción-ready** — Live en Vercel, 32 endpoints funcionales
- ✅ **Autenticación** — bcrypt + sessions HTTPOnly
- ✅ **Brand Brain** — 58 campos, MySQL, multi-tenant
- ✅ **Generación de contenido** — Claude 3.5 Haiku
- ✅ **Historial de conversaciones** — Persistencia + auto-resúmenes
- ⏳ **Modo Mentor Ácido** — Pendiente de integración
- ⏳ **Sync con vault** — Pendiente (ver Roadmap)
