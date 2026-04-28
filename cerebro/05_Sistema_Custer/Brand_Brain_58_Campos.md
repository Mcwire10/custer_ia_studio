# Brand Brain — Los 58 Campos

> **Concepto:** El Brand Brain es la memoria activa de cada marca dentro de Custer. Guarda en MySQL los 58 campos que definen la identidad completa de un cliente.
> **Última actualización:** 2026-04-28

---

## Relación con las Fichas ADN de Obsidian

Los 58 campos del Brand Brain son el equivalente técnico de las fichas `02_ADN_Marcas/*.md`. La diferencia:

| Obsidian ADN | Brand Brain Custer |
|---|---|
| Markdown legible por humanos | JSON en MySQL, legible por la IA |
| Editado manualmente | Editable en UI + auto-poblado |
| Fuente de verdad editorial | Fuente de verdad operativa |
| Versionado en git | Multi-tenant por user_id |

**La Fase 3 del roadmap conecta ambos:** un import lee el ADN de Obsidian y puebla el Brand Brain automáticamente.

---

## Los 11 Slides y sus Campos

### Slide 1 — Identidad Básica (5 campos)
| Campo | Descripción |
|---|---|
| `nombre` | Nombre de la marca |
| `rubro` | Industria / sector |
| `propuesta` | Propuesta de valor en una línea |
| `ciudad` | Ubicación principal |
| `logo` | URL o descripción del logo |

### Slide 2 — Voz & Tono (5 campos)
| Campo | Descripción | Mapeo ADN Obsidian |
|---|---|---|
| `voz` | Cómo habla la marca | Personalidad → Voz |
| `tono` | Registro emocional | Personalidad → Tono |
| `personalidad` | Adjetivos de personalidad | Personalidad → Actitud |
| `registro` | Formal / Informal / etc. | Personalidad → Energía |
| `maximas` | Frases o principios de comunicación | Lo que esta marca NO es |

### Slide 3 — Propósito & Estrategia (5 campos)
| Campo | Descripción | Mapeo ADN Obsidian |
|---|---|---|
| `proposito` | El por qué de la marca | Esencia de Marca |
| `mision` | Misión operativa | Valores Fundamentales |
| `vision` | Visión a futuro | Notas Estratégicas |
| `valores` | Lista de valores | Valores Fundamentales |
| `diferenciadores` | Qué la hace única | Posicionamiento → Diferencial |

### Slide 4 — Audiencia Detallada (6 campos)
| Campo | Descripción | Mapeo ADN Obsidian |
|---|---|---|
| `publico_objetivo` | Descripción general | Ficha → Audiencia primaria |
| `buyer_persona` | Perfil detallado | Mensajes Clave → Cliente habitual |
| `demografia` | Edad, género, ubicación | Ficha → Audiencia primaria |
| `psicografia` | Valores, estilo de vida | — |
| `motivaciones` | Qué los mueve a comprar | — |
| `pain_points` | Problemas que resuelve la marca | — |

### Slide 5 — Identidad Visual (6 campos)
| Campo | Descripción | Mapeo ADN Obsidian |
|---|---|---|
| `color_primario` | HEX color principal | Territorio Visual → Paleta |
| `color_secundario` | HEX color secundario | Territorio Visual → Paleta |
| `colores_acento` | HEX colores de acento | Territorio Visual → Paleta |
| `tipografia` | Fuente principal | Territorio Visual → Tipografía |
| `estilo_visual` | Descripción estética | Territorio Visual → Estética |
| `elementos_graficos` | Patrones, iconografía | Territorio Visual → Fotografía |

### Slide 6 — Sistema Gráfico (4 campos)
| Campo | Descripción |
|---|---|
| `iconografia` | Estilo de íconos |
| `patrones` | Patrones visuales recurrentes |
| `fotografia` | Estilo fotográfico |
| `paleta_emocional` | Qué emociones evoca lo visual |

### Slide 7 — Comunicación (5 campos)
| Campo | Descripción | Mapeo ADN Obsidian |
|---|---|---|
| `mensajes_clave` | Los mensajes principales | Mensajes Clave |
| `claims` | Frases de campaña recurrentes | — |
| `narrativa` | Arco narrativo de la marca | Esencia de Marca |
| `tagline` | Tagline oficial | — |
| `promises` | Promesas de marca | Mensajes Clave → Cliente nuevo |

### Slide 8 — Competencia (3 campos)
| Campo | Descripción |
|---|---|
| `competidores` | Lista de competidores principales |
| `posicionamiento_competitivo` | Dónde está la marca vs. la competencia |
| `diferenciadores_competitivos` | Qué la separa de los demás |

### Slide 9 — Canales & Distribución (4 campos)
| Campo | Descripción | Mapeo ADN Obsidian |
|---|---|---|
| `canales_principales` | Instagram, web, etc. | Ficha → Canal principal |
| `audiencia_por_canal` | Qué audiencia en cada canal | Mensajes Clave → Contexto digital |
| `mejores_horarios` | Horarios de mayor engagement | — |
| `restricciones` | Lo que no se publica o donde no aparece | Lo que esta marca NO es |

### Slide 10 — Métricas & Performance (7 campos)
| Campo | Descripción |
|---|---|
| `kpis` | KPIs principales de negocio |
| `engagement_rate` | Tasa de engagement actual |
| `followers` | Seguidores actuales |
| `hashtags` | Hashtags estratégicos |
| `reach` | Alcance promedio |
| `conversion` | Tasa de conversión |
| `roi` | ROI de campañas actuales |

### Slide 11 — Estrategia de Contenido (8 campos)
| Campo | Descripción |
|---|---|
| `pilares_tematicos` | Los 3-5 pilares de contenido |
| `frecuencia` | Con qué frecuencia se publica |
| `formatos` | Reels, carouseles, stories, etc. |
| `calendario` | Lógica del calendario editorial |
| `tests` | Qué se está testeando actualmente |
| `iteracion` | Ciclo de mejora de contenido |
| `guia_edicion` | Reglas de edición y postproducción |
| `casos_de_uso` | Situaciones específicas y cómo comunicar |

---

## Cómo se Guarda en MySQL

```sql
CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255),
  color VARCHAR(50),       -- color primario (acceso rápido)
  typography VARCHAR(255), -- tipografía (acceso rápido)
  data JSON,               -- los 58 campos completos
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX (user_id, updated_at)
);
```

Los campos de acceso frecuente (`name`, `color`, `typography`) tienen columna propia para queries rápidas. El resto vive en el JSON de `data`.

---

## Cómo se Usa en Generación

En cada llamada a `/api/generate`, el backend:
1. Lee el Brand Brain completo desde MySQL
2. Construye un bloque de contexto con todos los campos relevantes
3. Lo inyecta al prompt de Claude antes del brief del usuario
4. Claude genera contenido que ya "conoce" la marca

```javascript
// Ejemplo de contexto inyectado
const brandContext = `
MARCA: ${brand.name}
VOZ: ${brand.data.voz}
TONO: ${brand.data.tono}
COLOR PRIMARIO: ${brand.color}
TIPOGRAFÍA: ${brand.typography}
DIFERENCIADOR: ${brand.data.diferenciadores}
LO QUE NO ES: ${brand.data.maximas}
`;
```
