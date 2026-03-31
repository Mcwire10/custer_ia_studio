---
name: Brand Profile Generator
description: Carga referencias visuales previas y extrae el ADN visual/tonal de marca para uso en validaciones futuras
type: system
tags: [brand-audit, reference-library, brand-dna]
---

# Brand Profile Generator - Librería de Referencia de Marca

## Objetivo

Carga **piezas diseñadas anteriormente** (imágenes, links, descripciones) y extrae el **ADN visual y tonal** de la marca para que future briefs se validen automáticamente contra estos lineamientos.

## Cómo Funciona

### **PASO 1: Carga de Referencias**

Cuando tengas piezas previas, proporciona:

```
CARGAR REFERENCIAS DE MARCA

Cliente/Marca: [Nombre]
Tipo de campaña: [Diagnóstico, E-commerce, SaaS, etc.]

📸 REFERENCIA 1: [Descripción o link/imagen]
- Formato: [Carrusel / Feed / Stories / Video]
- Fecha: [Cuándo se lanzó]
- Resultado: [CTR / Conversión / Engagement logrado]
- Elementos clave: [Qué funcionó]

📸 REFERENCIA 2: [...]
📸 REFERENCIA 3: [...]

[Sube 3-5 piezas que "funcionaron bien"]
```

### **PASO 2: Extracción de Lineamientos (Brand Profile)**

Claude analizará AUTOMÁTICAMENTE cada referencia y extraerá:

#### **1. Paleta Visual**
```
Colores principales:
- Primario: [Color] (uso: [tipografía/fondo/acentos])
- Secundario: [Color] (uso: [])
- Neutros: [Grises/blancos/negros] (contraste usado)

Psicología detectada:
- Primario transmite: [Profesionalismo/Energía/Lujo/etc.]
- Combinación es para: [Target/Objetivo]
```

#### **2. Tipografía**
```
Tipografía Headlines:
- Familia: [Serif/Sans-serif/Display]
- Peso: [Bold/Semibold/Regular]
- Tamaño relativo: [Domina 40-50% del espacio]

Tipografía Body:
- Familia: [Sans-serif]
- Peso: [Regular/Light]
- Tamaño: [Legible en mobile]

Espaciado (leading/kerning):
- Aéreo vs. Comprimido: [Análisis]
```

#### **3. Composición Visual**
```
Patrón de Layout:
- Patrón dominante: [Z / F / Diagonal / Simétrico]
- Punto focal: [Dónde ponen el elemento principal]
- Espacio negativo: [Generoso / Justo / Comprimido]

Regla de tercios:
- Elementos clave caen en: [Intersecciones/Líneas]
- Breathing room: [Cómo usan márgenes]
```

#### **4. Estilo Fotográfico**
```
Fotografía/Ilustración:
- Estilo: [Minimalista/Fotografía real/Ilustración/Mixed]
- Iluminación: [Clave alta/media/baja, temperatura]
- Angulación: [Frontal/3/4/Cenital/etc.]
- Saturación: [Vibrante/Desaturada/Monocromática]

Personas/Rostros (si aplica):
- Expresión: [Natural/Staged/Lifestyle]
- Diversidad: [Representada]
- Contexto: [Aislado/Environmental]
```

#### **5. Tono de Copy**
```
Registro lingüístico:
- Formal/Casual: [Análisis]
- Jerga: [Técnica/Accesible/Mixta]
- Extensión: [Corto y directo / Narrativo / Explicativo]

Estructura preferida:
- Titular: [Máximo X palabras, patrón: Problema/Beneficio/Curiosidad]
- Subtítulo: [Expande/Justifica/Llama a acción]
- CTA: [Verbal directa/Soft/Urgente]

Tono emocional:
- Primario: [Profesional/Humano/Urgente/Aspiracional]
```

#### **6. Elementos Gráficos Repetitivos**
```
Iconografía:
- Estilo: [Minimalista/Outlined/Filled]
- Grosor de línea: [Consistente]
- Animación: [Si aplica]

Elementos decorativos:
- Formas recurrentes: [Cuadrados/círculos/líneas/etc.]
- Posición: [Esquinas/bordes/integrados]
```

---

## OUTPUT: El "Brand Profile" Generado

```
════════════════════════════════════════════════════════════════
BRAND PROFILE: [Cliente/Marca]
Generado: [Fecha]
Basado en: [X referencias analizadas]
════════════════════════════════════════════════════════════════

🎨 PALETA VISUAL
Primario: Azul #1E40AF (profesionalismo, confianza)
Secundario: Naranja #FF6B35 (acción, urgencia)
Neutro: Gris #F3F4F6 (breathing room)

✅ Psicología: Confianza + Energía = SaaS B2B agresivo pero profesional

────────────────────────────────────────────────────────────────

📝 TIPOGRAFÍA
Headlines: Inter Bold 48px (sans-serif moderno, aéreo)
Body: Inter Regular 16px (legible en mobile)
Leading: 1.6x (generoso, fácil de leer)

✅ Efecto: Moderno, accesible, "no intimidante"

────────────────────────────────────────────────────────────────

📐 COMPOSICIÓN
Patrón: Z-pattern (narrativo)
Punto focal: Centro-derecha (imagen/CTA)
Espacio negativo: 30-40% (generoso, de lujo)

✅ Sensación: Limpia, profesional, sin abarrotamiento

────────────────────────────────────────────────────────────────

📸 ESTILO FOTOGRÁFICO
Fotografía: Real (no stock obvio)
Iluminación: Clave media, frontal suave (confianza)
Saturación: Vibrante pero natural
Personas: Lifestyle, expresiones genuinas (humanidad)

✅ Efecto: "Real people, real use" (no corpo-robótico)

────────────────────────────────────────────────────────────────

💬 TONO DE COPY
Registro: Formal-casual (profesional pero amable)
Titular: 5-8 palabras, patrón Beneficio-Prueba
Subtítulo: Expande el beneficio (máx 15 palabras)
CTA: Verbal directa ("Accedé gratis" no "Enviar formulario")

✅ Voz: Experto accesible, confiable, sin jerga

────────────────────────────────────────────────────────────────

🎯 ELEMENTOS GRÁFICOS
Iconografía: Outlined, 2px grosor, minimalista
Decorativos: Líneas diagonales (movimiento, dinamismo)

✅ Estilo: Consistente, moderno, minimalista

════════════════════════════════════════════════════════════════

⚡ RECOMENDACIONES PARA NUEVOS BRIEFS:
✓ Siempre usar azul primario en CTA o elementos principales
✓ Fotografía debe ser "real" (no ilustración pura)
✓ Copy máx 5-8 palabras en titular
✓ Mantener 30-40% espacio negativo
✓ No mezclar tipografías: Inter es la estándar

════════════════════════════════════════════════════════════════
```

---

## PASO 3: Usar el Profile en Nuevos Briefs

Una vez generado el **Brand Profile**, úsalo así:

```
VALIDAR NUEVO BRIEF CONTRA PROFILE

Nuevo brief: [Pega el brief]

Validar contra Brand Profile: [Cliente/Marca]

¿Cumple con:
- Paleta (azul primario, naranja secundaria)?
- Tipografía (Inter Bold headlines)?
- Composición (Z-pattern, 30-40% espacio negativo)?
- Fotografía (estilo real, iluminación clave media)?
- Tono (formal-casual, 5-8 palabras en titular)?
- Elementos (iconografía outlined, líneas diagonales)?

Si hay desvíos, proponer corrección específica.
```

---

## Cómo Usarlo en Claude Code

### **Sesión 1: Cargar Referencias**

```bash
# En tu proyecto de Claude Code
claude /brand-profile-generator

Cargar referencias de marca:
- [Pega imagen 1]
- [Pega imagen 2]
- [Pega imagen 3]
```

Claude genera el **Brand Profile**.

### **Sesión 2+: Validar Nuevos Briefs**

```bash
# En la misma conversación (o guarda el Profile en un archivo)

claude "Valida este nuevo brief contra el Brand Profile generado"

[Pega nuevo brief]
```

---

## Cómo Usarlo en Claude Web

### **Sesión 1: Generar Profile**

1. Abre claude.com
2. Nuevo chat
3. Sube 3-5 imágenes de piezas previas (o describe las URLs)
4. Pega:

```
Analiza estas referencias de marca y genera un Brand Profile.

Para cada pieza, extrae:
1. Paleta visual (colores + psicología)
2. Tipografía (family, peso, tamaño relativo)
3. Composición (patrón Z/F/diagonal, punto focal)
4. Estilo fotográfico (iluminación, saturación, personas)
5. Tono de copy (registro, extensión, CTA)
6. Elementos gráficos (iconos, decorativos)

Genera un documento ejecutable que pueda usar para validar futuros briefs.
```

### **Sesión 2+: Guardar y Reutilizar**

- El Profile generado lo **copias a un documento** (Notion, Google Docs, etc.)
- En cada nuevo chat, lo **pegas arriba** del nuevo brief
- Claude valida automáticamente

---

## Estructura de Archivo para Guardar (Claude Code)

Si quieres guardar el Profile generado:

```
/AGENTES/skills/brand-profiles/
├── cliente-abc-profile.md
├── cliente-xyz-profile.md
└── cliente-xyz-profile.md
```

**Contenido del archivo:**

```markdown
# Brand Profile: [Cliente]

## Paleta Visual
[...]

## Tipografía
[...]

## Composición
[...]

[etc.]

---

**Usar en validaciones de nuevos briefs:**
```
Valida este brief contra el perfil de [Cliente] guardado arriba.
```
```

---

## Casos de Uso

1. **Onboarding de nuevo diseñador:**
   - Cargas 3-5 piezas de un cliente
   - El diseñador recibe el Brand Profile (no confusión)

2. **Audit de consistencia:**
   - Cargas todas las piezas de último trimestre
   - Identifica desvíos de marca

3. **Escalado con nuevos clientes:**
   - Generas Profile de cliente actual
   - Comparas con nuevos clientes para encontrar sinergias

4. **Brief automático:**
   - Generas Profile
   - Cada nuevo brief se valida automáticamente contra él
   - Menos ciclos de revisión

---

## Pro Tips

- **Actualiza el Profile cada trimestre** (la marca evoluciona)
- **Documenta el "por qué"** de cada decisión (contextual invaluable)
- **Guarda referencias que "ganaron"** (CTR/conversión alto, no mediocres)
- **Versiona los Profiles** (en algún momento necesitarás cambiar paleta)

