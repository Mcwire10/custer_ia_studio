# 🚀 Brand Brain Expandido - Quick Start para Programador

## **En 2 minutos:**

Brand Brain pasó de 2 slides → **10 slides con 40+ campos**

El usuario quería una "memoria de marca" completa que sirva para:
1. Auto-llenar campos en Generador
2. Validar alineación en Validador
3. Guardar y reutilizar

## **Archivos que necesitas**

```
/agentes/custer_ai_studio/
├── BRAND_BRAIN_STRUCTURE.md          ← Lee esto primero (10 min)
├── BRAND_BRAIN_EXPANDED_SLIDES.html  ← Copia este HTML (700 líneas)
├── BRAND_BRAIN_INTEGRATION_GUIDE.md  ← Sigue estos pasos (8-10 horas)
└── BRAND_BRAIN_EXPANSION_SUMMARY.md  ← Contexto general
```

## **Lo que hacer HOY (2 horas)**

1. **Copia el HTML**
   - Abre `BRAND_BRAIN_EXPANDED_SLIDES.html`
   - Busca `<div class="brain-slide">` (hay 10)
   - Reemplaza el contenido de `brain-slider-container` en `studio-v2.html` línea 1464

2. **Agrega funciones JavaScript básicas**
   ```javascript
   function toggleBrandVoice(element, value) {
     element.classList.toggle('active');
   }

   function selectStyle(element, value) {
     element.classList.toggle('active');
   }

   function collectBrainData() {
     return {
       nombre: document.getElementById('brandName').value,
       rubro: document.getElementById('rubro').value,
       // ... todos los campos
     };
   }
   ```

3. **Sincroniza color pickers**
   ```javascript
   document.getElementById('colorPrimary').addEventListener('input', (e) => {
     document.getElementById('colorPrimaryHex').value = e.target.value.toUpperCase();
   });
   ```

## **Lo que hacer MAÑANA-PASADO (4-6 horas)**

1. **Actualiza DB**
   ```sql
   ALTER TABLE brands ADD COLUMN brain_data JSON DEFAULT NULL;
   ```

2. **Modifica `/api/brands/route.js`**
   - POST: Guardar `JSON.stringify(brain)` en `brain_data`
   - GET: Retornar `JSON.parse(brain_data)` completo

## **Lo que hacer PRÓXIMA SEMANA (8-10 horas)**

1. **Generador**: Accede a `brain.vozTono.voz`, `brain.mensajería.mensajesClave`, etc.
2. **Validador**: Valida alineación con propósito, misión, valores

## **Checklist de Integración**

### HTML & UI (2h)
- [ ] Copiar 10 slides a studio-v2.html
- [ ] Testing: Todos los inputs aparecen
- [ ] Testing: Navegación entre slides funciona
- [ ] Testing: Color picker actualiza hex

### Funciones JS (3h)
- [ ] toggleBrandVoice() funciona
- [ ] selectStyle() funciona
- [ ] toggleChannel() funciona
- [ ] collectBrainData() retorna objeto completo
- [ ] exportBrandBrain('json') descarga JSON
- [ ] saveBrandBrain() hace POST a /api/brands

### Backend (3h)
- [ ] Schema actualizado (brain_data JSON)
- [ ] POST /api/brands guarda brain completo
- [ ] GET /api/brands/:id retorna brain completo
- [ ] Testing con Postman o curl

### Generador (2-3h)
- [ ] Lee `brain.vozTono.voz`
- [ ] Lee `brain.mensajería.mensajesClave`
- [ ] Aplica en system prompt de Claude
- [ ] Testing: Genera contenido "en voz" de marca

### Validador (2-3h)
- [ ] Valida presencia de mensajes clave
- [ ] Valida alineación con valores
- [ ] Valida cumplimiento de promesas
- [ ] Testing: Score refleja alineación

## **Preguntas FAQ**

**P: ¿Tengo que cambiar studio-v2.html?**
A: Sí, reemplaza el contenido de `brain-slider-container` (línea ~1464)

**P: ¿Cuántas líneas de código?**
A: ~50-100 líneas de JS + ~700 líneas de HTML = total ~800 líneas nuevas

**P: ¿Se rompe algo existente?**
A: No, es reemplazo puro. Estructura del HTML igual, solo más slides

**P: ¿Impacta performance?**
A: No notablemente. Slides se cargan lazy al navegar

**P: ¿Cómo manejo regresar a un brand guardado?**
A: `GET /api/brands/:id` retorna todo el brain → populate() rellena los inputs

## **Snippets Listos para Copiar**

### Sincronizar color picker
```javascript
['colorPrimary', 'colorSecondary', 'colorAccent', 'colorNeutral'].forEach(id => {
  document.getElementById(id).addEventListener('input', (e) => {
    document.getElementById(id + 'Hex').value = e.target.value.toUpperCase();
  });
});
```

### Export JSON
```javascript
function exportBrandBrain(format) {
  const brain = collectBrainData();
  const json = JSON.stringify(brain, null, 2);

  if (format === 'json') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-${brain.nombre || 'sin-nombre'}.json`;
    a.click();
  }
}
```

### Guardar a BD
```javascript
function saveBrandBrain() {
  const brain = collectBrainData();

  fetch('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brain)
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      alert(`✅ Brand guardado con ID: ${data.id}`);
      localStorage.setItem('currentBrandId', data.id);
    }
  });
}
```

## **Testing Final**

```bash
# 1. Abre la app
npm run dev

# 2. Navega a Brain tab
# 3. Completa los 10 slides
# 4. Click "Guardar en BD"
# 5. Verifica en MySQL:
SELECT * FROM brands WHERE name = 'tu marca';

# 6. Revisa que brain_data contenga JSON completo
```

---

**Tiempo total: ~2 semanas (8h/día) o ~4 semanas (4h/día)**

**Questions? Lee BRAND_BRAIN_INTEGRATION_GUIDE.md para detalles completos** 📖
