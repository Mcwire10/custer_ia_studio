# 🎯 COACH DE MARKETING & DISEÑO - Arquitectura

## Visión
Sistema que actúa como **coach educativo**, no solo como "corrector":
- ✅ Enseña MIENTRAS corrige (explica el POR QUÉ)
- ✅ Usa contexto completo de la marca
- ✅ Sugiere estrategia, no solo tácticas
- ✅ Acompaña el crecimiento del usuario

---

## DATOS QUE NECESITA CAPTURAR

### 1️⃣ CONTEXTO ESTRATÉGICO
```javascript
{
  mercado: {
    pais: "Argentina",                          // Ubicación geográfica
    region: "LATAM",                            // Región
    industria: "marketing digital",             // Industria/rubro
    nicho: "agencias marketing",                // Nicho específico
    tamanio_mercado: "descripción",             // Mercado: grande/emergente
  },

  competencia: {
    competidores_principales: ["Agencia X", "Agencia Y"],
    diferenciales: "Lo que nos diferencia",
    ventajas_competitivas: ["Ventaja 1", "Ventaja 2"],
    amenazas: ["Amenaza 1"]
  },

  audience: {
    buyer_persona: "CEO/Marketing Manager de PYMES",
    edad: "30-50",
    dolor: "No tener dirección clara en marketing",
    aspiracion: "Campañas que generen ROI real",
    plataformas_principales: ["LinkedIn", "WhatsApp"]
  }
}
```

### 2️⃣ PRESENCIA DIGITAL
```javascript
{
  redes_sociales: {
    instagram: {
      usuario: "@custer_agencia",
      seguidores: 5000,
      engagement_rate: 3.5,                   // %
      mejor_horario: "19:00-21:00",
      tipo_contenido_mejor: "testimonios, case studies"
    },
    linkedin: {
      seguidores: 2000,
      engagement_rate: 5.2,
      tipo_contenido_mejor: "artículos, insights"
    },
    tiktok: { /* ... */ }
  },

  sitio_web: {
    url: "custer.com.ar",
    principales_sections: ["servicios", "casos", "blog"],
    cta_principal: "Agendar demo"
  }
}
```

### 3️⃣ HISTORIAL DE CAMPAÑAS & MÉTRICAS
```javascript
{
  campanas_exitosas: [
    {
      nombre: "Awareness - Lanzamiento nuevo servicio",
      canal: "Instagram Ads",
      objetivo: "awareness",
      resultado: "45% CTR, 2.5% CPC",
      que_funciono: "Testimonios de clientes, video corto",
      fecha: "2024-01"
    }
  ],

  campanas_fallidas: [
    {
      nombre: "Conversión directa - Landing page",
      canal: "Google Ads",
      objetivo: "conversion",
      resultado: "0.3% CTR, muy caro",
      que_no_funciono: "CTA demasiado directo sin contexto",
      fecha: "2023-12"
    }
  ],

  metricas_generales: {
    roi_promedio: "3.5:1",
    cac: "$45",
    ltv: "$800",
    churn: "8%"
  }
}
```

### 4️⃣ IDENTIDAD + POSICIONAMIENTO
```javascript
{
  brand_positioning: {
    claim_principal: "No es tener agencia. Es tener dirección.",
    propuesta_valor: "Campañas con estrategia clara + ejecución impecable",
    diferenciadores: [
      "Metodología propia de análisis",
      "Acompañamiento constante",
      "Transparencia en métricas"
    ]
  },

  valores: ["Transparencia", "Innovación", "Resultados"],

  linea_visual: {
    colores: ["#6860EE", "#F5A623", "#4ADE80"],
    tipografia: "Gotham",
    fotografia: "realista, descontracturada, con personas",
    illustraciones: "estilo moderno geométrico"
  }
}
```

### 5️⃣ TONO DE VOZ ESPECÍFICO
```javascript
{
  registro: "profesional-casual",              // Nivel de formalidad

  características: {
    usa_emojis: true,
    usa_datos: true,
    usa_humor: "ocasional",
    es_directo: true,
    es_empático: true
  },

  palabras_clave: ["dirección", "estrategia", "resultados", "transparencia"],

  lo_que_SI_decimos: [
    "Campañas con propósito",
    "Analizar antes de actuar",
    "Datos que hablan"
  ],

  lo_que_NO_decimos: [
    "Promesas de viral",
    "Resultados sin contexto",
    "Tácticas sin estrategia"
  ]
}
```

### 6️⃣ EMOCIONES OBJETIVO
```javascript
{
  emociones_por_stage: {
    awareness: {
      generar: ["curiosidad", "empoderamiento"],
      evitar: ["miedo", "overwhelm"]
    },
    consideration: {
      generar: ["confianza", "esperanza"],
      evitar: ["presión", "confusión"]
    },
    conversion: {
      generar: ["urgencia", "seguridad"],
      evitar: ["arrepentimiento"]
    }
  },

  emociones_marca: {
    actual: "Confiable pero corporativo",
    deseada: "Confiable + innovador + cercano"
  }
}
```

---

## CÓMO USA EL COACH ESTA INFORMACIÓN

### Al validar contenido:

```
ENTRADA:
- Contenido a validar
- Contexto de marca (⬆️ TODOS los datos arriba)
- Objetivo (awareness/consideration/conversion)

PROCESO:
1. Analiza contenido contra IDENTIDAD de marca
2. Valida alineación con POSICIONAMIENTO
3. Sugiere cambios específicos (no genéricos)
4. EXPLICA el por qué:
   - Principios de marketing aplicados
   - Referencia al contexto/mercado
   - Conexión con emociones objetivo
5. Sugiere estrategia futura basada en HISTORIAL

SALIDA:
✅ Versión optimizada (texto listo para copiar)
💡 Por qué cada cambio (educación)
🎯 Sugerencias estratégicas futuras
📊 Conexión con métricas históricas
```

---

## ESTRUCTURA DEL VALIDADOR COMO COACH

```
COACH ANALYSIS OUTPUT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ANÁLISIS ESTRATÉGICO
├─ Objetivo detectado: Awareness
├─ Stage del funnel: Activación
└─ Emociones a generar: Curiosidad + Empoderamiento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERSIÓN OPTIMIZADA
[Texto mejorado, listo para copiar/pegar]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 POR QUÉ CADA CAMBIO (Educativo)

Cambio 1: Título → "Descubre" en lugar de "Nuestro"
   💡 Principio: Copy debe enfocarse en USUARIO, no marca
   📊 Contexto: Estudios muestran 45% CTR ↑ con copy user-centric
   🎯 Emoción: Crea curiosidad (objetivo awareness)
   📈 Tu historial: Éxito en campañas que usaron este patrón

Cambio 2: Agregar testimonial
   💡 Principio: Prueba social → confianza
   📊 Contexto: LinkedIn engagement 5.2% con testimonios
   🎯 Emoción: Genera seguridad + empoderamiento
   📈 Métrica: Tu buyer persona responde 3x mejor a customer stories

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔮 ESTRATEGIA FUTURA (Coaching)
1. Después de esto, testeá con variación X (basado en tu historial)
2. Mide engagement en primeras 2 horas (es crítico para algoritmo)
3. A/B test: Esta versión vs versión con CTA más directa
4. Próximo paso: Consideration → necesitarás añadir diferenciadores

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## IMPLEMENTACIÓN (ROADMAP)

### FASE 1: Brand Brain Expandido
- [ ] Agregar 5 nuevos slides al Brand Brain (contexto estratégico)
- [ ] Guardar en localStorage con estructura clara
- [ ] Crear validación: marca debe tener 50%+ completo para usar Coach

### FASE 2: Coach Engine
- [ ] Crear `/api/coach-analyze` - Nuevo endpoint análisis profundo
- [ ] Mejorar prompt a Claude para actuar como coach
- [ ] Incluir contexto completo en request

### FASE 3: UI Coach
- [ ] Validador muestra "análisis estratégico"
- [ ] Explica cada cambio con principios + contexto
- [ ] Muestra "estrategia futura" recomendada
- [ ] Interfaz educativa clara

### FASE 4: Aprendizaje continuo
- [ ] Guardar resultados de campañas (engagement, conversión)
- [ ] Coach mejora recomendaciones con datos reales
- [ ] Sistema aprende qué funciona para ESTA marca específica

---

## CLAVE DEL ÉXITO

El Coach no solo **corrige**, sino que:
1. **Enseña** - Explica principios de marketing/diseño
2. **Contextualiza** - Usa datos de la marca, mercado, competencia
3. **Acompaña** - Sugiere qué hacer después, cómo crecer
4. **Personaliza** - Todo es específico a esta marca (no genérico)
5. **Inspira** - Ayuda al usuario a desarrollar mejor intuición marketing

Es un **compañero de crecimiento**, no un robot.
