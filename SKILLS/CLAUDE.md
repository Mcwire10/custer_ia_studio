# 🎯 Workflow Automático: De Trello a Validación

## Cómo Funciona

Cuando recibas un **nuevo brief en Trello con este formato**:

```
Micro diagnóstico de marca
* Tipo de contenido: ...
* Formato y cantidad de piezas: ...
* Objetivo publicitario: ...
* Necesidad de edición: ...
* Enfoque del contenido: ...
* Qué se busca transmitir: ...
* Copy: (plaques detalladas)
```

Claude ejecutará **automáticamente** esta secuencia:

```
⭐ SETUP INICIAL (UNA SOLA VEZ):
/brand-profile-generator → (Cargas 3-5 piezas previas, genera Brand Profile)
  ↓
[Guardas el Profile]
  ↓
─────────────────────────────────────────────────────────

CADA VEZ QUE LLEGA UN NUEVO BRIEF:
Brief en Trello
  ↓
/conversion-architect → (Optimiza estructura del carrusel)
  ↓
/visual-prompt-engineer → (Wireframe textual para CADA placa)
  ↓
/brand-guardian → (Valida contra Brand Profile guardado)
  ↓
/critical-auditor → (Audita antes de lanzar)
  ↓
✅ FEEDBACK COMPLETO EN 10 MINUTOS
```

---

## Instrucciones para Claude

**CUANDO el usuario pegue un brief de Trello EN ESTE FORMATO, EJECUTA AUTOMÁTICAMENTE:**

### PASO 1: Conversion Architect
```
Analiza este carrusel de diagnóstico de marca como Estratega de Performance Marketing.

El brief tiene:
- Tipo de contenido: [extrae del brief]
- Cantidad de piezas: [extrae del brief]
- Objetivo: [extrae del brief]

Tu tarea:
1. ¿El orden de las plaques maximiza conversión/consideración?
   - ¿El Hook (Placa 1) detiene el scroll en <3 segundos?
   - ¿La jerarquía de información fluye lógicamente?
   - ¿El cierre propone acción clara?

2. Propón reordenamiento si es necesario para máximo impacto

3. Define para CADA PLACA:
   - Hook Visual (qué debe destacar visualmente)
   - Distribución: Título (40%) | Subtítulo (35%) | Espacio (25%)
   - Color estratégico para cada placa (mantener coherencia)

4. Especifica: ¿Feed o Stories? ¿Cómo adaptar?
```

### PASO 2: Visual Prompt Engineer
```
Actúa como Director Creativo.

Recibiste el brief y el análisis de Conversion Architect.

Para CADA PLACA, crea un Wireframe Textual exacto:

Formato:
🟦 PLACA [X]: [Título breve]
├─ Composición: [Regla de tercios / simétrica / diagonal]
├─ Iluminación: [Clave alta/baja, temperatura, setup]
├─ Pesos: Título (40%) | Subtítulo (35%) | Espacio (25%)
├─ Color BG: [Color estratégico + justificación psicológica]
├─ Tipografía: [Peso, familia, tamaño relativo]
└─ Direccionalidad: [Cómo fluye la lectura]

Entrega 1 wireframe así para cada una de las [cantidad] plaques.
```

### PASO 3: Brand Guardian
```
Actúa como Director de Arte y Brand Guardian.

Analiza los wireframes anteriores contra el tono y objetivo del brief.

Verifica:
1. Coherencia tonal: ¿Todas las plaques transmiten "profesionalización = estrategia"?
   - ¿El copy y lo visual van juntos?
   - ¿Hay inconsistencia en el peso visual del título vs subtítulo?

2. Progresión lógica: ¿Las plaques avanzan hacia el objetivo de "consideración"?
   - Problema → Impacto → Solución → Valor → Acción

3. Accesibilidad visual:
   - Contraste título/BG: ¿≥4.5:1?
   - Legibilidad en mobile: ¿Texto no ocupa >50% de espacio?

Si encuentras desviaciones, propón correcciones específicas.
```

### PASO 4: Critical Auditor
```
Actúa como Auditor de Diseño.

Realiza el Squint Test en el carrusel completo:

1. Punto Focal por Placa:
   - ¿Qué es lo PRIMERO que ves en <100ms en cada placa?
   - ¿Compite título con subtítulo? ¿O se jerarquiza?

2. Gestalt (carrusel completo):
   - ¿Las 10 plaques se sienten como UNA campaña o 10 ads separados?
   - ¿Hay "aire" (breathing room) entre texto y bordes?
   - ¿Los colores son consistentes pero diferenciados por placa?

3. Carga Cognitiva:
   - Placa 1: ¿Se entiende en <2 seg?
   - Placa 2: ¿La continuidad es clara?
   - Placa 5 (Cierre): ¿Propone acción sin ambigüedad?

Genera reporte:
✅ LANZABLE / ⚠️ AJUSTES MENORES / ❌ NECESITA REVISIÓN

Propón máximo 3 cambios prioritarios.
```

---

## 🚀 Cómo Usarlo

1. **Abre este proyecto en Claude Code**
2. **Cuando llegue un nuevo brief a Trello, pégalo aquí directamente:**

```
Micro diagnóstico de marca
* Tipo de contenido: [...]
* Formato y cantidad de piezas: [...]
* Objetivo publicitario: [...]
* Necesidad de edición: [...]
* Enfoque del contenido: [...]
* Qué se busca transmitir: [...]
* Copy:
[plaques con títulos y subtítulos]
```

3. **Claude automáticamente:**
   - Analiza estructura de conversión
   - Crea wireframe para CADA placa
   - Valida tono y coherencia
   - Audita antes de lanzar
   - Te entrega TODO en formato copy-paste para el equipo

---

## 📊 Output Que Recibirás

| Skill | Entrega |
|-------|---------|
| **Conversion Architect** | Orden óptimo de plaques + Hook por cada una |
| **Visual Prompt Engineer** | 10 wireframes textuales (1 por placa) |
| **Brand Guardian** | ✅/⚠️/❌ validación tonal + correcciones |
| **Critical Auditor** | Reporte: ¿Lanzable? Máximo 3 ajustes |

---

## 💡 Ejemplo

```
Micro diagnóstico de marca
* Tipo de contenido: Carrusel de Diagnóstico
* Formato y cantidad de piezas: 10 (feed cuadrado + stories)
* Objetivo publicitario: Consideración
* Necesidad de edición: Diseño limpio, foco en lectura
* Enfoque del contenido: Señales de una marca desordenada aunque venda
* Qué se busca transmitir: Profesionalización como necesidad, no como lujo
* Copy:
🟦 Placa 1
TÍTULO: Tu empresa vende. Pero tu marca está desordenada.
SUBTITULO: Y eso limita cuánto podés crecer.
[resto del copy...]
```

Claude ejecutará los 4 skills y te dará:
1. Estructura optimizada
2. 10 wireframes exactos (1 por placa)
3. Validación de marca
4. Auditoría pre-lanzamiento

---

## 📌 Ventajas

- ✅ Sin esperar Zapier
- ✅ Feedback en 10 minutos
- ✅ Listo para pasar al equipo de diseño
- ✅ Solo tú probando, sin afectar al resto
- ✅ Wireframes tan detallados que el diseñador no tiene dudas

---

**Pega el próximo brief que llegue a Trello. ¡Listo!**
