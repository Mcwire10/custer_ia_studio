# 📋 COACH DE MARKETING - PLAN DE IMPLEMENTACIÓN

**Status**: Ready to Start
**Estimado**: 4-6 horas (4 fases)
**Prioridad**: HIGH

---

## 🎬 EXTENSIÓN: REELS & VIDEO CONTENT

El Coach también analizará **Reels** (Instagram/TikTok). Necesita capturar:

### Video Metrics a Capturar en Brand Brain:
```javascript
{
  video_content: {
    reels_promedio: {
      duracion_optima: "15-30 segundos",
      hook_duration: "0-2 segundos críticos",
      pacing: "rápido, con transiciones",
      musica_style: "trending, energética, viral"
    },

    mejor_performance: {
      tipo_reel: "Tutorial / Before-After / Testimonio",
      hook_style: "Pregunta / Shock / Intriga",
      duracion_exitosa: "22 segundos",
      engagement_promedio: "8.5%"
    },

    audio_favorito: [
      "Nombre de audio trending 1",
      "Nombre de audio trending 2"
    ],

    captions_style: "Emojis + texto grande + colores contrastantes",
    transiciones_favoritas: ["Corte rápido", "Fade", "Zoom"]
  }
}
```

### Análisis de Coach para Reels:

```
ENTRADA:
- Guión de reel (o descripción)
- Objetivo (awareness/consideration/conversion)
- Duración prevista
- Contexto de marca (colores, tono, emociones)

ANÁLISIS:
1. HOOK (primeros 2 segundos)
   ├─ ¿Genera curiosidad en primeros 2 seg?
   ├─ Emoción: ¿Qué siente usuario?
   └─ Sugerencias específicas si falla

2. ESTRUCTURA
   ├─ Duración: ¿Optimizada para algoritmo?
   ├─ Pacing: ¿Ritmo mantiene atención?
   └─ Transiciones: ¿Visuales impactantes?

3. CTA & CIERRE
   ├─ ¿CTA clara al final?
   ├─ ¿Impulsa acción deseada?
   └─ Sugerencias de timing

4. AUDIO & MÚSICA
   ├─ ¿Audio es trending?
   ├─ ¿Muestra tendencia actual?
   └─ Alternativas si no funciona

5. CAPTIONS & TEXTO
   ├─ ¿Texto es legible (móvil)?
   ├─ ¿Emojis atraen atención?
   └─ Mejoras visuales

SALIDA:
✅ Guión mejorado (listo para filmar)
📚 Por qué cada cambio (educativo)
🔮 Qué audio usar (trending)
📊 Duración + pacing optimizado
```

---

## 📅 PLAN DE IMPLEMENTACIÓN (4 FASES)

### ⏱️ Timeline
- **FASE 1**: 60 min - Brand Brain expandido
- **FASE 2**: 90 min - Coach Engine (endpoint)
- **FASE 3**: 60 min - UI Coach (validador mejorado)
- **FASE 4**: 30 min - Testing + refinamiento

---

### FASE 1: BRAND BRAIN EXPANDIDO ✅ HACER AHORA

**Objetivo**: Capturar contexto estratégico completo

**Cambios**:
- [ ] Agregar 5 nuevos slides al carousel Brain Brain
  - Slide 2: Contexto Estratégico (mercado, competencia, buyer persona)
  - Slide 3: Presencia Digital (redes, follower, engagement)
  - Slide 4: Historial Campañas (qué funcionó, qué no, métricas)
  - Slide 5: Identidad + Posicionamiento (claims, diferenciales)
  - Slide 6: Tono de Voz & Emociones (registro, palabras clave, emociones objetivo)

- [ ] Agregar sección de VIDEO METRICS
  - Duración óptima de reels
  - Hook style (pregunta/shock/intriga)
  - Audio trending favorites
  - Pacing preferences

- [ ] Validación: Marcar progreso (% completado)
  - 25% = Básico (nombre, rubro, color)
  - 50% = Intermedio (+ identidad visual)
  - 75% = Avanzado (+ posicionamiento)
  - 100% = Coach listo (todo capturado)

**Archivos a modificar**:
- `public/studio-v2.html` - Agregar slides

**Estructura localStorage**:
```javascript
currentBrand: {
  // Existentes
  nombre, rubro, propuesta, color_primario, tipografia_principal,

  // NUEVOS - CONTEXTO ESTRATÉGICO
  estrategia: {
    mercado: { pais, region, industria, nicho },
    competencia: { competidores, diferenciales, ventajas },
    audience: { buyer_persona, edad, dolor, aspiracion }
  },

  // NUEVOS - PRESENCIA DIGITAL
  presencia: {
    instagram: { usuario, seguidores, engagement_rate, mejor_horario },
    linkedin: { seguidores, engagement_rate },
    sitio_web: { url, cta_principal }
  },

  // NUEVOS - HISTORIAL
  historial: {
    campanas_exitosas: [{nombre, canal, objetivo, resultado}],
    campanas_fallidas: [{nombre, canal, resultado}],
    metricas: { roi_promedio, cac, ltv }
  },

  // NUEVOS - IDENTIDAD
  posicionamiento: {
    claim_principal,
    propuesta_valor,
    diferenciadores: [],
    valores: []
  },

  // NUEVOS - TONO
  tono_voz: {
    registro: "profesional-casual",
    palabras_clave: [],
    lo_que_SI_decimos: [],
    lo_que_NO_decimos: []
  },

  // NUEVOS - EMOCIONES
  emociones: {
    por_stage: { awareness: {...}, consideration: {...}, conversion: {...} }
  },

  // NUEVOS - VIDEO
  video: {
    reels_optimo: { duracion, hook_duration, pacing },
    mejor_performance: { tipo_reel, hook_style, engagement },
    audio_favorito: [],
    captions_style: "..."
  }
}
```

---

### FASE 2: COACH ENGINE ✅ HACER DESPUÉS

**Objetivo**: Crear endpoint que analiza como coach

**Cambios**:
- [ ] Crear `/app/api/coach-analyze/route.js` (nuevo endpoint)
  - Input: contenido + contexto_completo_marca
  - Output: análisis educativo profundo

- [ ] Mejorar prompt a Claude
  - Actúe como coach, no bot
  - Explique cada cambio
  - Use contexto de marca
  - Sugiera estrategia futura

**Endpoint estructura**:
```javascript
POST /api/coach-analyze
{
  content: "texto/guión a analizar",
  content_type: "copy|reel|post|carusel",  // ← NUEVO: soporta Reels
  brand: currentBrand,                      // TODA la info
  objetivo: "awareness|consideration|conversion",
  target_platform: "instagram|tiktok|linkedin|facebook"
}

Response:
{
  analisis_estrategico: {
    objetivo_detectado,
    stage_funnel,
    emociones_a_generar
  },

  version_optimizada: "texto mejorado listo para copiar",

  explicaciones: [
    {
      cambio: "Cambio 1",
      principio_marketing: "Copy user-centric",
      contexto_marca: "Tu CTR subió 45% con esto",
      emocion: "Curiosidad",
      referencia_historial: "Éxito en campaña X"
    }
  ],

  estrategia_futura: {
    siguiente_paso: "Probar con audio trending X",
    como_testear: "A/B test 24hs",
    metrica_clave: "Engagement primeros 3 seg"
  },

  recomendaciones_video: {  // ← NUEVO para Reels
    hook_sugerido: "Pregunta provocadora",
    duracion_optima: "22 segundos",
    audio_trending: "Nombre de audio",
    transicion_clave: "Corte rápido zoom",
    caption_style: "Emoji + texto grande"
  }
}
```

---

### FASE 3: UI COACH ✅ HACER DESPUÉS

**Objetivo**: Mostrar análisis educativo en validador

**Cambios**:
- [ ] Mejorar sección "Versión Optimizada"
  - Mostrar análisis estratégico arriba
  - Versión mejorada en el medio
  - Explicaciones educativas abajo

- [ ] Crear sección "Por Qué Cada Cambio"
  - Principio de marketing
  - Contexto de marca
  - Referencia a historial
  - Emoción que genera

- [ ] Crear sección "Estrategia Futura"
  - Próximo paso
  - Cómo testear
  - Métricas clave
  - Coaching: "Los mejores crean variaciones constantemente"

- [ ] Sección especial para REELS
  - Hook analysis
  - Audio recommendations
  - Duración + pacing
  - Caption styling

**Estructura visual**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ANÁLISIS ESTRATÉGICO
├─ Objetivo: Awareness
├─ Stage: Activación
└─ Emociones: Curiosidad + Empoderamiento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERSIÓN OPTIMIZADA
[Texto listo para copiar/pegar]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 POR QUÉ CADA CAMBIO

Cambio 1: "Descubre" en lugar de "Nuestro"
  💡 Principio: Copy user-centric
  📊 Tu contexto: LinkedIn 5.2% engagement con user-focus
  🎯 Emoción: Genera curiosidad (objetivo awareness)
  📈 Historial: Éxito en campaña "Awareness - Lanzamiento"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔮 ESTRATEGIA FUTURA (Coaching)
1. Testea esta versión 24hs
2. Mide: Engagement primeros 3 segundos
3. Si CTR > 2%, escala; si no, A/B test con variación X
4. Próximo: Consideration stage → agrega diferenciadores

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 REELS (Si aplica)
├─ Hook: Pregunta provocadora (0-2 seg)
├─ Audio: Usa "Nombre trending #X" (8.5% engagement)
├─ Duración: 22 segundos (óptimo para tu audiencia)
├─ Pacing: Corte rápido cada 3 seg (mantiene atención)
└─ Caption: Emoji + texto blanco 40px (legible móvil)
```

---

### FASE 4: TESTING & REFINAMIENTO

**Testing cases**:
- [ ] Coach analiza copy (existente funciona)
- [ ] Coach analiza reel guión
- [ ] Validar contexto se usa en explicaciones
- [ ] Historiales se cargan correctamente
- [ ] UI es clara y educativa

---

## 🎯 MÉTRICAS DE ÉXITO

✅ **FASE 1**: Brand Brain captura contexto (50%+ info + Coach funciona)
✅ **FASE 2**: Endpoint devuelve análisis educativo con explicaciones
✅ **FASE 3**: UI muestra coaching claro + recomendaciones futuras
✅ **FASE 4**: Usuario aprende mientras mejora contenido

---

## 📝 CAMBIOS EN PROMPTS A CLAUDE

### Para `/api/coach-analyze`:

```
Eres un COACH DE MARKETING & DISEÑO experto, no un bot corrector.

Tu marca: {TODA la info de currentBrand}

Tu tarea es:
1. ANALIZAR el contenido contra la identidad de marca
2. EXPLICAR por qué cada cambio mejora (educativo)
3. CONTEXTUALIZAR con datos reales de la marca
4. RECOMENDAR estrategia futura (coaching)

NUNCA devuelvas:
- Sugerencias genéricas
- "Mejora esto" sin explicar POR QUÉ
- Cambios que no alinean con identidad

SIEMPRE devuelve:
- Versión mejorada (listo para copiar)
- Principio marketing aplicado
- Contexto: "Tu CTR fue X%", "Tu audiencia prefiere Y"
- Emoción que genera cada cambio
- Siguiente paso recomendado

Si es REEL:
- Analiza hook (primeros 2 seg)
- Recomienda audio trending
- Sugiere pacing + transiciones
- Caption styling para móvil

Responde en JSON, no en markdown.
```

---

## 🚀 COMENZAMOS CON FASE 1 AHORA

**Próximos pasos**:
1. Expandir Brand Brain (agregar 5 slides)
2. Crear estructura localStorage
3. Commit
4. Testing rápido
5. FASE 2

---

## 💾 ARCHIVOS A CREAR/MODIFICAR

**Crear**:
- `/app/api/coach-analyze/route.js` (FASE 2)

**Modificar**:
- `public/studio-v2.html` (FASE 1 + FASE 3)
- `app/api/validate/route.js` (mejorar prompt para coaches - FASE 2)

---

## 📚 DOCUMENTACIÓN COMPLETADA
- ✅ `COACH_ARCHITECTURE.md` - Qué datos capturar
- ✅ `COACH_IMPLEMENTATION_PLAN.md` - Este archivo (cómo hacerlo)

---

**Status**: ✅ READY TO IMPLEMENT PHASE 1
