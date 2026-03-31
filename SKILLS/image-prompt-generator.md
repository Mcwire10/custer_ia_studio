---
name: Image Prompt Generator
description: Convierte wireframes textuales en prompts optimizados para DALL-E, Midjourney o Stable Diffusion
type: system
tags: [image-generation, dall-e, midjourney, visual-creation]
---

# Image Prompt Generator - De Wireframe a Imagen

## Objetivo

Toma el **Wireframe Textual** generado por Visual Prompt Engineer y lo convierte en prompts listos para copiar-pegar en:
- ✅ **DALL-E 3** (OpenAI)
- ✅ **Midjourney** (v6)
- ✅ **Stable Diffusion** (ComfyUI, WebUI)
- ✅ **Adobe Firefly**

## Cómo Funciona

### **ENTRADA: Wireframe Textual**

```
🟦 PLACA [X]: [Título breve]
├─ Composición: Diagonal descendente
├─ Iluminación: Clave media, luz lateral suave
├─ Pesos: Título 40% | Subtítulo 35% | Espacio 25%
├─ Color BG: Azul Royal (#4F46E5)
└─ Tipografía: Sans-serif Bold amarilla
```

### **SALIDA: Prompts por Plataforma**

---

## 📝 GENERADOR DE PROMPTS

### **Para DALL-E 3 (más legible en texto)**

**Estructura:**
```
[ESTILO] [COMPOSICIÓN] [ELEMENTOS] [COLORES] [ILUMINACIÓN] [DETALLES TÉCNICOS]
```

**Ejemplo output:**

```
DALL-E 3 PROMPT

Modern minimalist design, Z-diagonal composition with bold headline in the upper-center.
Color: Royal blue background (#4F46E5), accent yellow text (#FCD34D), subtle pink gradient
in top-right corner. Soft lateral lighting, medium key. Clean sans-serif typography dominating
40% of space. Decorative 3D geometric shapes (circles, soft curves) in bottom-right.
High-quality, professional, marketing material, 1080x1920 vertical format,
no people, no photography, illustration style, clean white breathing room (35-40% of space).
```

**Fórmula:**
```
[ESTILO] [COMPOSICIÓN] [COLORES EXACTOS] [ILUMINACIÓN] [TIPOGRAFÍA]
[ELEMENTOS VISUALES] [DETALLES] [FORMATO] [RESTRICCIONES]
```

---

### **Para Midjourney v6 (parámetros avanzados)**

**Estructura:**
```
[VISIÓN] [COMPOSICIÓN] [ESTILO] [COLORES] [ILUMINACIÓN] [TÉCNICA] --ar [RATIO] --v 6
```

**Ejemplo output:**

```
MIDJOURNEY PROMPT

Modern marketing card, Z-diagonal composition, Royal blue bold sans-serif headline
(45% of frame) in yellow, white subtitle text below, soft pink-purple gradient accent
in corner, 3D minimalist decorative elements, lateral key light, medium brightness,
clean breathing room, professional aesthetic, illustration style, no people --ar 9:16
--v 6 --q 2
```

**Parámetros Midjourney:**
```
--ar 9:16        (vertical para Stories)
--ar 1:1         (cuadrado para Feed)
--v 6            (versión 6 - mejor calidad)
--q 2            (quality: más detalle)
--s 750          (stylize: estilo más pronunciado)
--niji            (opcional: estilo más anime/3D cartoon)
```

---

### **Para Stable Diffusion (ComfyUI/WebUI)**

**Estructura (Positivo):**
```
[QUALITY TAGS] [COMPOSICIÓN] [ESTILO] [COLORES] [ILUMINACIÓN] [ELEMENTOS] [TÉCNICA]
```

**Estructura (Negativo - lo que NO quieres):**
```
bad quality, blurry, text, artifacts, people, photography, realistic, watermark
```

**Ejemplo output:**

```
STABLE DIFFUSION - POSITIVE PROMPT

masterpiece, high quality, professional design, modern marketing card,
diagonal composition with emphasis on bold text, royal blue background with yellow
accents, pink gradient corner element, 3D minimalist geometric shapes,
clean sans-serif typography dominating composition, soft lateral lighting,
medium key light, 40% breathing room, illustration style, vertical format,
trending on behance

NEGATIVE PROMPT

bad quality, blurry, text artifacts, realistic photography, people, watermark,
low contrast, busy composition, too many elements, serif fonts, dark lighting
```

---

## 🎯 TEMPLATE COMPLETO POR PLACA

Para cada placa del carrusel, genera:

```
════════════════════════════════════════════════════════════════
🟦 PLACA [X]: [Título]
════════════════════════════════════════════════════════════════

📐 WIREFRAME RECORDATORIO:
- Composición: [...]
- Colores: [...]
- Iluminación: [...]

─────────────────────────────────────────────────────────────

🤖 DALL-E 3 PROMPT
[Prompt completo para DALL-E]

─────────────────────────────────────────────────────────────

🎨 MIDJOURNEY PROMPT
[Prompt + parámetros para Midjourney]

─────────────────────────────────────────────────────────────

⚙️ STABLE DIFFUSION
POSITIVO:
[Prompt positivo]

NEGATIVO:
[Prompt negativo]

────────────────────────────────────────────────────────────────
```

---

## 🔧 REGLAS DE CONVERSIÓN (Wireframe → Prompt)

### **Composición**
| Wireframe | DALL-E | Midjourney | Stable Diffusion |
|-----------|--------|-----------|------------------|
| Z-pattern | "Z-diagonal composition" | "Z-diagonal composition" | "diagonal composition with emphasis" |
| Regla tercios | "rule of thirds composition" | "rule of thirds layout" | "balanced composition following rule of thirds" |
| Simétrica | "symmetrical centered" | "perfect symmetry, centered" | "perfectly symmetrical" |

### **Iluminación**
| Wireframe | DALL-E | Midjourney | Stable Diffusion |
|-----------|--------|-----------|------------------|
| Clave alta | "high key lighting, bright" | "bright high-key lighting" | "high key lighting, bright, luminous" |
| Clave media | "medium key light, natural" | "soft medium key lighting" | "medium key, soft shadows" |
| Clave baja | "dramatic low-key, dark" | "dark moody low-key" | "dark moody low-key lighting" |
| Lateral 45° | "soft lateral lighting" | "45-degree side lighting" | "soft lateral light from side" |

### **Colores (Ser ESPECÍFICO)**
```
SIEMPRE incluir:
- Código HEX exacto (#4F46E5)
- Descripción: "Royal blue, vibrant yellow, pure white"
- Dónde va cada color: "blue background, yellow text, white accents"
- Acentos: "subtle pink-purple gradient in corner"
```

### **Tipografía**
| Wireframe | Prompt |
|-----------|--------|
| Bold headlines | "bold sans-serif headlines dominating 40% of space" |
| Alternancia color | "yellow and white text alternating for emphasis" |
| Regular body | "regular weight subtitle text in smaller size" |
| Sans-serif moderno | "modern sans-serif, clean, contemporary" |

### **Elementos Visuales**
```
3D minimalista → "3D minimalist geometric shapes, clean, modern"
Botones redondeados → "rounded button with smooth border-radius"
Gradientes → "subtle gradient overlay from pink to purple"
Decorativos → "decorative abstract circles in corner"
Ilustraciones → "illustration style, not photography"
Mockups → "landing page mockup, website interface, 3D render"
```

### **Restricciones Clave**
```
SIEMPRE agregar al final:
- Formato: "--ar 9:16 vertical" ó "--ar 1:1 square"
- Estilo: "illustration style, not photorealistic"
- Prohibiciones: "no people, no photography, no realistic"
- Calidad: "professional, high-quality, trending on [plataforma]"
```

---

## 📋 EJEMPLO COMPLETO: Placa 1 (Custer)

**WIREFRAME:**
```
🟦 PLACA 1: Hook Principal
├─ Composición: Diagonal ascendente izq→der
├─ Iluminación: Clave media, luz frontal suave
├─ Pesos: Título (amarillo bold) 50% | Espacio 35% | Elementos 3D 15%
├─ Color: Azul Royal #4F46E5 BG, Amarillo #FCD34D texto, Rosa #C084FC gradiente
└─ Elementos: Círculos 3D sutiles en esquina superior derecha
```

**OUTPUT GENERADO:**

```
════════════════════════════════════════════════════════════════
🟦 PLACA 1: Hook - "Una landing que vende"
════════════════════════════════════════════════════════════════

🤖 DALL-E 3 PROMPT

Modern marketing landing page design with diagonal ascending composition,
bright yellow bold sans-serif headline reading "Una landing que vende"
dominating 50% of frame, on royal blue background (#4F46E5), subtle white
subtitle text below, soft pink-purple gradient accent in upper-right corner,
3D minimalist geometric circles as decorative elements, medium-key frontal
lighting, clean breathing space (35%), professional illustration style,
vertical mobile format, no text artifacts, no people, no photography,
trending on Behance, high quality, 1080x1920px.

─────────────────────────────────────────────────────────────

🎨 MIDJOURNEY PROMPT

modern marketing card, diagonal ascending composition, bright bold sans-serif
headline in vibrant yellow (#FCD34D), royalblue background (#4F46E5), white
subtitle text, soft pink gradient accent top-right, 3D minimalist geometric
elements, medium-key frontal lighting, 50% headline dominance, 35% breathing
room, illustration style, clean professional --ar 9:16 --v 6 --q 2 --s 750

─────────────────────────────────────────────────────────────

⚙️ STABLE DIFFUSION

POSITIVO:
masterpiece, high quality, professional design, marketing card, diagonal
ascending composition, bold yellow sans-serif text reading "Una landing que vende",
royal blue background, white accent text, soft pink-purple gradient corner element,
3D minimalist geometric circles, medium-key frontal lighting, 50% text dominance,
clean breathing space, illustration style, vertical mobile format, trending

NEGATIVO:
bad quality, blurry, text artifacts, photorealistic, people, photography,
watermark, low contrast, serif fonts, dark shadows, busy, too many elements

────────────────────────────────────────────────────────────────
```

---

## ✨ PRO TIPS

1. **Copiar directo:** Los prompts están listos para copiar-pegar
2. **Iteración rápida:** Si no te gusta, cambia "bold" a "stronger" o colores
3. **Consistencia:** Usa los MISMOS prompts en DALL-E + Midjourney para comparar
4. **Mockup final:** Toma la imagen generada y aplícala en mockup de iPhone/tablet
5. **Refinamiento:** Los primeros resultados pueden necesitar 2-3 iteraciones

---

## 🎯 FLUJO COMPLETO

```
Wireframe Textual (Visual Prompt Engineer)
         ↓
Image Prompt Generator
         ↓
Prompts listos (DALL-E / Midjourney / SD)
         ↓
Copia-pega en herramienta de imagen
         ↓
Genera imagen
         ↓
Refina si es necesario
```

---

## 🚀 CÓMO USARLO

**En Claude Web:**

```
Tengo estos wireframes textuales de plaques Custer:
[Pega los wireframes de cada placa]

Convierte a prompts para:
1. DALL-E 3
2. Midjourney v6
3. Stable Diffusion

Incluye el wireframe recordatorio, prompts listos para copiar-pegar,
y parámetros específicos.
```

**En Claude Code:**

```
claude /image-prompt-generator

[Pega wireframes]
```

