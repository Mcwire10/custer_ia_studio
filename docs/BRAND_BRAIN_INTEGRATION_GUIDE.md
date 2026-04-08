# 🧠 Brand Brain Expandido - Guía de Integración

## **¿Qué cambió?**

El Brand Brain ahora tiene **10 diapositivas** en lugar de 2, cubriendo TODA la memoria de marca:

| Slide | Tema | Campos |
|-------|------|--------|
| 1️⃣ | Cargar marca | Métodos de carga + análisis visual (EXISTENTE) |
| 2️⃣ | Estrategia | Propósito, Misión, Visión, Valores (6 campos) |
| 3️⃣ | Diferenciadores | Propuesta única + 3 diferenciadores (4 campos) |
| 4️⃣ | Voz & Tono | Voz, Personalidad, Máximas (3 campos) |
| 5️⃣ | Posicionamiento | Industria, Mercado, Audiencia, Competencia (6 campos) |
| 6️⃣ | Identidad Visual | Colores, Tipografía, Estilo, Fotografía (8 campos) |
| 7️⃣ | Mensajería | Mensajes, Tagline, Story, Promesas (4 campos) |
| 8️⃣ | Aplicación | Canales, Restricciones, Excepciones (3 campos) |
| 9️⃣ | Social Media | Handle, Métricas, Hashtags, Tono (5 campos) |
| 🎬 | Resumen | Export JSON + Guardar BD (2 botones) |

**Total: 40+ campos de información de marca**

---

## **Pasos de Integración**

### **1. Copiar los slides**

El archivo `BRAND_BRAIN_EXPANDED_SLIDES.html` contiene los 10 slides listos para copiar.

Ubicación en `studio-v2.html`:
```
Línea 1464: <div class="brain-slider-container" id="brainSlider">
              <!-- Slides existente -->
            </div>
```

**Acción**: Reemplaza el contenido del `brain-slider-container` con los nuevos slides.

### **2. Agregar funciones JavaScript**

Crear funciones para:

```javascript
// Toggle/select helpers
function toggleBrandVoice(element, value) {
  // Toggle visual del voice selected
  element.classList.toggle('active');
  // Guardar en hidden input
}

function selectStyle(element, value) {
  // Similar a toggleBrandVoice
}

function toggleChannel(element) {
  // Toggle channel selection
}

// Color sync
const colorPrimary = document.getElementById('colorPrimary');
const colorPrimaryHex = document.getElementById('colorPrimaryHex');
colorPrimary.addEventListener('input', (e) => {
  colorPrimaryHex.value = e.target.value.toUpperCase();
});

// Export & Save
function exportBrandBrain(format) {
  const brain = collectBrainData();
  if (format === 'json') {
    downloadJSON(brain);
  }
}

function saveBrandBrain() {
  const brain = collectBrainData();
  // POST a /api/brands con todos los datos
  fetch('/api/brands', {
    method: 'POST',
    body: JSON.stringify(brain),
    headers: { 'Content-Type': 'application/json' }
  }).then(r => r.json()).then(data => {
    alert('✅ Brand guardado con ID: ' + data.id);
  });
}

function collectBrainData() {
  return {
    nombre: document.getElementById('brandName').value,
    rubro: document.getElementById('rubro').value,
    // ... todos los campos de las 10 slides
    estrategia: {
      propósito: document.getElementById('brandPurpose').value,
      misión: document.getElementById('brandMission').value,
      visión: document.getElementById('brandVision').value,
      valores: [
        document.getElementById('valor1').value,
        document.getElementById('valor2').value,
        // ...
      ]
    },
    diferenciadores: {
      propuestaÚnica: document.getElementById('uniqueProposition').value,
      competitivos: [
        document.getElementById('diff1').value,
        // ...
      ]
    },
    vozTono: {
      voz: document.getElementById('brandVoiceSelected').value,
      personalidad: [...],
      máximas: document.getElementById('brandMaxims').value
    },
    posicionamiento: {
      industria: document.getElementById('marketIndustry').value,
      mercado: document.getElementById('targetMarket').value,
      audienciaPrimaria: document.getElementById('primaryAudience').value,
      audienciasSecundarias: document.getElementById('secondaryAudience').value,
      competidores: [...],
      posición: document.getElementById('competitivePosition').value
    },
    identidadVisual: {
      colorPrimario: document.getElementById('colorPrimaryHex').value,
      colorSecundario: document.getElementById('colorSecondaryHex').value,
      colorAccento: document.getElementById('colorAccentHex').value,
      colorNeutro: document.getElementById('colorNeutralHex').value,
      tipografíaPrincipal: document.getElementById('typoPrimary').value,
      tipografíaSecundaria: document.getElementById('typoSecondary').value,
      estilo: document.getElementById('styleSelected').value,
      fotografía: document.getElementById('photoStyle').value
    },
    mensajería: {
      mensajesClave: [...],
      tagline: document.getElementById('tagline').value,
      story: document.getElementById('brandStory').value,
      promesas: document.getElementById('brandPromises').value
    },
    aplicación: {
      canales: document.getElementById('channelsSelected').value.split(','),
      restricciones: document.getElementById('brandRestrictions').value,
      excepciones: document.getElementById('brandExceptions').value
    },
    socialMedia: {
      handle: document.getElementById('socialHandle').value,
      seguidores: document.getElementById('socialFollowers').value,
      engagement: document.getElementById('socialEngagement').value,
      frecuencia: document.getElementById('socialPostFreq').value,
      mejoresHoras: document.getElementById('bestHours').value,
      hashtags: document.getElementById('topHashtags').value.split('\n'),
      tonePorCanal: document.getElementById('tonePorCanal').value
    }
  };
}

function sharebrainBrain() {
  const brain = collectBrainData();
  const jsonStr = JSON.stringify(brain, null, 2);
  // Copiar al clipboard
  navigator.clipboard.writeText(jsonStr).then(() => {
    alert('✅ Brand Brain copiado al clipboard - Puedes compartir con tu equipo');
  });
}
```

### **3. Actualizar la base de datos (MySQL)**

El esquema existente en `/lib/brands-db.js` necesita soportar estos campos.

**Opción A: Usar JSON column** (Recomendado)
```sql
ALTER TABLE brands ADD COLUMN brain_data JSON DEFAULT NULL;
```

Esto permite guardar toda la estructura compleja en un campo JSON.

**Opción B: Agregar columnas específicas**
```sql
ALTER TABLE brands ADD COLUMN propósito TEXT;
ALTER TABLE brands ADD COLUMN misión TEXT;
ALTER TABLE brands ADD COLUMN visión TEXT;
ALTER TABLE brands ADD COLUMN valores JSON;
-- ... etc (más trabajo, pero más queryable)
```

### **4. Actualizar `/api/brands/route.js`**

Modificar POST handler para guardar `brain_data`:

```javascript
// POST /api/brands
export async function POST(request) {
  const brain = await request.json();

  const query = `
    INSERT INTO brands (
      name, rubro, brain_data, created_at, updated_at
    ) VALUES (?, ?, ?, NOW(), NOW())
  `;

  const [result] = await db.execute(query, [
    brain.nombre,
    brain.rubro,
    JSON.stringify(brain) // Guardar todo el objeto
  ]);

  return Response.json({
    success: true,
    id: result.insertId,
    brand: brain
  });
}

// GET /api/brands/:id
export async function GET(request, { params }) {
  const { id } = params;

  const query = 'SELECT * FROM brands WHERE id = ?';
  const [rows] = await db.execute(query, [id]);

  if (rows.length === 0) {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const row = rows[0];
  const brain = JSON.parse(row.brain_data);

  return Response.json({
    success: true,
    brand: brain,
    id: row.id,
    created_at: row.created_at
  });
}
```

### **5. Actualizar el Generador**

El Generador ahora tiene MUCHO más contexto:

```javascript
// En /app/api/generate/route.js
const brandContext = {
  propósito: brain.estrategia.propósito,
  misión: brain.estrategia.misión,
  valores: brain.estrategia.valores,
  voz: brain.vozTono.voz,
  tono: brain.vozTono.personalidad,
  audiencia: brain.posicionamiento.audienciaPrimaria,
  posición: brain.posicionamiento.posición,
  mensajesClave: brain.mensajería.mensajesClave,
  promesas: brain.mensajería.promesas,
  canales: brain.aplicación.canales
};

// Pasar al prompt de Claude:
const systemPrompt = `
Eres un generador de contenido experto. Crea contenido que:
- Respete la voz y tono: ${brandContext.voz}
- Se alinee con estos valores: ${brandContext.valores.join(', ')}
- Hable a: ${brandContext.audiencia}
- Comunique estos mensajes: ${brandContext.mensajesClave.join(', ')}
- Mantenga estas promesas: ${brandContext.promesas}
- Para estos canales: ${brandContext.canales.join(', ')}
`;
```

### **6. Actualizar el Validador**

El Validador ahora puede validar MUCHO más:

```javascript
function validateContent(content, brand) {
  const score = {
    alignment: 100,
    issues: [],
    suggestions: []
  };

  // Validar tono
  if (!hasVoiceTone(content, brand.vozTono.voz)) {
    score.alignment -= 15;
    score.issues.push('⚠️ Tono no coincide con voz de marca');
  }

  // Validar mensajes clave
  let messagesFound = 0;
  brand.mensajería.mensajesClave.forEach(msg => {
    if (content.includes(msg)) messagesFound++;
  });
  if (messagesFound === 0) {
    score.suggestions.push('💡 Considera incluir uno de tus mensajes clave');
  }

  // Validar audiencia
  if (!isAppropriateForAudience(content, brand.posicionamiento.audienciaPrimaria)) {
    score.alignment -= 10;
    score.issues.push('⚠️ Contenido no resonará con tu audiencia');
  }

  // Validar promesas
  if (!fullfillsPromises(content, brand.mensajería.promesas)) {
    score.alignment -= 20;
    score.issues.push('⚠️ No cumple con tus promesas de marca');
  }

  return score;
}
```

---

## **Impacto en toda la App**

Una vez completado:

### ✅ **Brand Loader**
- Carga TODAS las 10 diapositivas
- Análisis visual auto-completa varios campos
- Todo se guarda en MySQL con ID único

### ✅ **Generador**
- Acceso a 40+ campos de contexto
- Genera contenido altamente alineado
- Respeta voz, tono, mensajes, audiencia

### ✅ **Validador**
- Valida alineación completa
- Detecta desviaciones de tono
- Verifica presencia de valores/promesas
- Score más preciso (0-100)

### ✅ **Brain**
- Interfaz de 10 slides intuitiva
- Cada diapositiva enfocada en un tema
- Progress de completitud visible
- Export a JSON para documentación

### ✅ **Reportes** (Nuevo)
- Brand Consistency Report
- Tone Analysis Report
- Message Penetration Report
- Audience Resonance Report

---

## **Orden de Implementación**

1. **Hoy**: Copiar slides HTML + Agregar funciones JS básicas (2h)
2. **Mañana**: Integrar BD + Actualizar API (2h)
3. **Día 3**: Actualizar Generador con contexto (2h)
4. **Día 4**: Mejorar Validador (2h)
5. **Día 5**: Testing completo (2h)

**Total: 10 horas (~1.5 días de trabajo)**

---

## **Resultado Final**

Un **Brand Brain completamente expandido** que sirve como:
- 📚 **Documentación** completa de marca
- 🤖 **Contexto** para todas las IAs
- 📊 **Fuente de verdad** para toda decisión de branding
- 🔄 **Memoria persistente** en MySQL
- 📤 **Shareable** con el equipo

**Éxito: La memoria de la marca al servicio de la IA.** 🚀
