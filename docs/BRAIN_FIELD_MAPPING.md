# 🧠 Brain Field Mapping - 58 Campos del Brand Brain

**Documento**: Mapeo completo de los 58 campos del Brand Brain de `/public/studio-v2.html`

**Storage**: Todos los campos se almacenan en la columna `data` (JSON) de la tabla `brands`
- Los campos principales (nombre, rubro, colores, tipografía, estilo) también en columnas específicas
- Los 58 campos se retornan completamente cuando se carga una marca

---

## 📋 Mapeo de Campos (HTML ID → Variable)

### Slide 1: Identidad Básica
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbNombre` | nombre | string | Nombre de la marca |
| `bbRubro` | rubro | string | Industria/sector |
| `bbCiudad` | ciudad | string | Ubicación geográfica |
| `bbPropuesta` | propuesta | text | Propuesta de valor |
| `bbPublico` | publico | text | Público objetivo |

### Slide 2: Voz & Tono
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbFont` | tipografia | string | Tipografía principal (legacy) |
| `bbRegistro` | registro | select | Formal / Casual / Coloquial |
| `bbKeywords` | keywords | string | Palabras clave de marca |
| `bbAvoid` | avoid | string | Palabras a evitar |
| `bbEjemplos` | ejemplos | text | Ejemplos de textos representativos |

### Slide 3: Propósito & Estrategia
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbMision` | mision | text | Misión de la marca |
| `bbVision` | vision | text | Visión a futuro |
| `bbValores` | valores | string | Valores principales (comma-separated) |
| `bbBeneficiosFuncionales` | beneficiosFuncionales | text | Beneficios prácticos |
| `bbBeneficiosEmocionales` | beneficiosEmocionales | text | Beneficios emocionales |

### Slide 4: Audiencia Detallada
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbAudienciaDemografica` | audienciaDemografica | text | Datos demográficos |
| `bbAudienciaReal` | audienciaReal | text | Descripción comportamental |
| `bbPainPoints` | painPoints | string | Problemas que resuelve |
| `bbGains` | gains | string | Beneficios que genera |
| `bbMotivaciones` | motivaciones | text | Motivaciones de compra |
| `bbComportamientoDigital` | comportamientoDigital | text | Comportamiento en redes |

### Slide 5: Identidad Visual
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbLogo` | logo | file | Logo de la marca |
| `bbColorPrimario` | color_primario | color | Color primario (#6860EE) |
| `bbColorSecundario` | color_secundario | color | Color secundario (#F5A623) |
| `bbAcentos` | acentos | string | Colores acentos (comma-separated) |
| `bbTipoPrincipal` | tipografia_principal | string | Fuente principal (Gotham) |
| `bbTipoSecundaria` | tipografia_secundaria | string | Fuente secundaria (Montserrat) |

### Slide 6: Sistema Gráfico
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbEstiloVisual` | estilo_visual | select | Moderno / Clásico / Minimalista |
| `bbRecursosGraficos` | recursosGraficos | string | Elementos gráficos |
| `bbSistemaGrafico` | sistemaGrafico | text | Descripción del sistema |
| `bbMoodBoard` | moodBoard | text | Referentes visuales |

### Slide 7: Comunicación
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbVozTono` | vozTono | text | Pilares comunicacionales |
| `bbClaim` | claim | string | Claim o tagline |
| `bbNarrativa` | narrativa | text | Historia de la marca |
| `bbTerritorioCreativo` | territorioCreativo | text | Espacio creativo |
| `bbTonalidad2` | tonalidad | string | Tonalidad descriptiva |

### Slide 8: Competencia
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbCompetenciaDirecta` | competenciaDirecta | string | Competidores directos |
| `bbDiferenciadores` | diferenciadores | string | Diferenciadores clave |
| `bbPropuestaUnica` | propuestaUnica | text | Propuesta única |

### Slide 9: Canales & Distribución
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbCanales` | canales | string | Canales de distribución |
| `bbInstagramSeguidores` | instagramSeguidores | number | Followers en Instagram |
| `bbInstagramEngagement` | instagramEngagement | number | Engagement rate |
| `bbLinkedinSeguidores` | linkedinSeguidores | number | Followers en LinkedIn |

### Slide 10: Métricas & Performance
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbCAC` | cac | number | Costo de Adquisición de Cliente |
| `bbLTV` | ltv | number | Lifetime Value |
| `bbROIPromedio` | roiPromedio | number | ROI promedio |
| `bbCampañaExitosaNombre` | campaniaExitosaNombre | string | Nombre de campaña exitosa |
| `bbCampañaExitosaCanal` | campaniaExitosaCanal | string | Canal de campaña |
| `bbCampañaExitosaQue` | campaniaExitosaQue | text | Qué fue lo exitoso |
| `bbCampañaExitosaResultado` | campaniaExitosaResultado | string | Resultado de campaña |

### Slide 11: Estrategia de Contenido
| HTML ID | Campo | Tipo | Descripción |
|---------|-------|------|-------------|
| `bbFormatos` | formatos | string | Formatos de contenido |
| `bbFrecuencia` | frecuencia | string | Frecuencia de publicación |
| `bbMejorHorario` | mejorHorario | string | Mejor horario de publicación |
| `bbDuracionOptima` | duracionOptima | string | Duración óptima de contenido |
| `bbHookStyle` | hookStyle | string | Estilo de hooks |
| `bbCaptionsStyle` | captionsStyle | string | Estilo de captions |
| `bbPacingTransiciones` | pacingTransiciones | string | Pacing de transiciones |
| `bbAudioFavorito` | audioFavorito | string | Audio favorito para videos |

---

## 💾 Almacenamiento en BD

### Tabla: `brands`

**Columnas específicas** (acceso rápido):
- `id` - ID único
- `user_id` - Usuario propietario (multi-tenancy)
- `name` - Nombre de marca (unique per user)
- `rubro` - Industria
- `propuesta` - Propuesta de valor
- `color_primario` - Color primario (#6860EE)
- `color_secundario` - Color secundario (#F5A623)
- `tipografia_principal` - Fuente principal (Gotham)
- `estilo_visual` - Estilo visual
- `data` - **JSON con los 58 campos**
- `created_at` - Timestamp creación
- `updated_at` - Timestamp actualización

### Columna `data` (JSON)

Almacena TODOS los 58 campos como objeto JSON:
```json
{
  "nombre": "Custer",
  "rubro": "Marketing",
  "ciudad": "Villa María",
  // ... todos los 58 campos ...
  "audioFavorito": "lo-fi beats"
}
```

---

## 🔄 Flujo de Datos

### Guardar Marca (POST /api/brands)
1. Frontend envía objeto con 58 campos
2. Backend lo recibe en `consolidateBrandData()`
3. Extrae campos principales → columnas específicas
4. Guarda TODO como JSON en columna `data`
5. Guarda en BD con `saveBrand(brandData, userId)`

### Cargar Marca (GET /api/brands/:id)
1. Backend obtiene fila de BD
2. Llama `parseBrand(dbBrand)`
3. Parsea JSON de columna `data`
4. Retorna 58 campos mergeados (columnas + JSON)
5. Frontend recibe objeto completo

### Actualizar Marca (PUT /api/brands/:id)
1. Frontend envía cambios
2. Backend merges con datos existentes
3. Actualiza columnas específicas + JSON
4. Guarda con timestamp actualizado

---

## ✅ Validación

### Validación en Frontend (studio-v2.html)
- Cada campo tiene placeholder y validación inline
- Las funciones `fillBrandFields()` y `updateBrainPreview()` leen los 58 campos
- El guardado se hace con `saveBrandData()`

### Validación en Backend (/api/brands/route.js)
- Autenticación: `getCurrentUser()` valida que sea el dueño
- Requeridos: `nombre` es obligatorio
- Tipos: JSON schema validation (opcional - considerar agregar)
- Limites: Max 100 marcas por usuario (query LIMIT)

---

## 🚀 Testing Checklist (Phase 6)

- [ ] Crear marca con todos los 58 campos
- [ ] Verificar que se guardan correctamente en BD
- [ ] Cargar marca y verificar que retorna los 58 campos
- [ ] Editar campos individuales y guardar
- [ ] Verificar que los datos persisten después de refresh
- [ ] Probar con múltiples usuarios (no ven marcas de otros)
- [ ] Validar JSON en columna `data`
- [ ] Probar autocompletar desde `/api/auto-populate-brand`

---

**Último actualizado**: 2026-04-08 Session 2
**Estado**: Phase 6 - Database Validation IN PROGRESS
