---
name: Custer AI Studio Generator
colors:
  brand: "#6860EE"
  brand-light: "#8B7FFF"
  brand-hover: "#4A4199"
  accent: "#F5A623"
  accent-light: "#FFB84D"
  surface: "#0D0C1E"
  surface-elevated: "#1A1830"
  surface-card: "#252541"
  on-surface: "#F5F5F5"
  on-surface-secondary: "#B8B8B8"
  on-surface-muted: "#808080"
  success: "#10B981"
  warning: "#F5A623"
  error: "#EF4444"
typography:
  display:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 3rem
    fontWeight: "700"
    lineHeight: 1.1
    letterSpacing: -0.03em
  h1:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 2.25rem
    fontWeight: "600"
    lineHeight: 1.2
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: "600"
    lineHeight: 1.3
  h3:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1.25rem
    fontWeight: "600"
    lineHeight: 1.4
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: "400"
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: "400"
    lineHeight: 1.5
  label:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 0.75rem
    fontWeight: "600"
    lineHeight: 1.4
    letterSpacing: 0.05em
    textTransform: uppercase
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
    fontWeight: "600"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  card:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid rgba(104, 96, 238, 0.2)"
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    border: "1px solid rgba(104, 96, 238, 0.2)"
  input-focus:
    borderColor: "{colors.brand}"
    boxShadow: "0 0 0 3px rgba(104, 96, 238, 0.25)"
---

## Overview

Estilo visual para el Generador de piezas de Custer AI Studio. El generador crea HTML/CSS autónomo para piezas de marketing digital (Instagram, stories, flyers, banners email, carruseles).

## Philosophy

El generador debe producir piezas que demuestren:
- **Claridad inmediata** - El mensaje se entiende en 1 segundo
- **Jerarquía visual clara** - Lo importante destaca, lo secundario Supporting
- **Profundidad estratégica** - Sombras, transparencias, layers que den volumen
- **Animación sutil** - Micro-interacciones que agreguen vida sin distraer
- **Profesionalismo agency** - Calidad comparable a diseñadores de agencia top, no "AI genérica"

## Colors

Paleta base para piezas generadas. Las marcas pueden tener sus propios tokens que se mergean.

- **Brand (#6860EE):** Primary actions, call-to-actions, highlightear elementos clave
- **Accent (#F5A623):** Notificaciones importantes, badges, acentos estratégicos
- **Surface (#0D0C1E):** Fondos principales (dark mode) - da profundidad y sofisticación
- **Surface Elevated (#1A1830):** Cards, elementos que necesitan separación del fondo
- **On Surface (#F5F5F5):** Texto principal - máximo contraste
- **On Surface Secondary (#B8B8B8):** Subtítulos, metadata
- **On Surface Muted (#808080):** Placeholders, hints (usar con precaución - verificar contraste)

## Typography

Sistema tipográfico basado en Inter para máximo rendimiento yzero dependencias externas.

- **Display:** Títulos de máximo impacto, números grandes (stats, métricas)
- **H1:** Headlines principales de secciones
- **H2:** Subtítulos de secciones, títulos de tarjetas
- **H3:** Labels de grupos, encabezados de listas
- **Body:** Texto principal de contenido
- **Body-sm:** Descripciones, metadata
- **Label:** Tags, badges, botones kleinen

Reglas de aplicación:
- `text-wrap: balance` para headlines
- `letter-spacing: -0.03em` en display y h1
- `text-wrap: pretty` en body multilínea

## Spacing

Sistema basado en múltiplos de 4px para consistencia.

- Espaciado uniforme = profesionalismo
- `gap: 16px` estándar para grids
- `gap: 8px` para elementos relacionados tight
- `margin: 24px` entre secciones
- Padding interno de cards: `24px`

## Effects & Animation

Para piezas que lo requieran:

### Animaciones CSS (no JS)
- `fadeIn` - entrada sutil
- `slideUp` - desde abajo
- `pulse` - para badges de "nuevo"
- `float` - para elementos decorativos sutiles

### Efectos especiales (usar con criterio)
- **Glassmorphism:** `backdrop-filter: blur(20px)` + `background: rgba(255,255,255,0.1)` + border sutil
- **Gradient text:** Para headlines de impacto
- **Mesh gradient:** Para fondos sofisticados
- **Neon glow:** Para piezas dark con acentos brillantes
- **Shimmer:** Para loaders o estados de "procesando"

## Do's

✅ Usar OKLCH o HSL para colores derivados matemáticamente de un solo --hue
✅ SVG inline de Lucide o Heroicons para íconos (NO emoji para diseño)
✅ Máx 3 colores de acento + neutros derivados
✅ Sombras con dirección de luz consistente (arriba-izquierda)
✅ Animar solo `transform` y `opacity` (nunca layout properties)
✅ Diseño responsive que funcione en mobile y desktop

## Don'ts

❌ No usar más de 2 imágenes externas por pieza (priorizar CSS, SVG, gradientes)
❌ No usar Google Fonts - usar system font stacks o Embedded WOFF2
❌ No generar animaciones que dependan de JS externo
❌ No crear piezas que pesen más de 500KB
❌ No usar emojis para elementos de diseño - solo para UI states