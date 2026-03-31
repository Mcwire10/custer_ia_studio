# 🎨 Creative Engineering Skills for Claude

Suite de 4 skills especializados para flujos de trabajo creativos, enfocados en diseño, branding y performance marketing.

---

## 📋 Índice de Skills

### 1. **Brand Guardian**
**Archivo:** `brand-guardian.md`

**¿Cuándo usarlo?**
- Entra un nuevo brief y necesitas validar que cumple con la marca
- Quieres evitar ciclos de revisión por inconsistencias visuales
- Necesitas feedback rápido en tono, tipografía y paleta

**Lo que hace:**
- Analiza jerarquía visual y tipografía
- Verifica alineación de tono y arquetipo de marca
- Valida cumplimiento de accesibilidad visual
- Propone correcciones específicas con terminología profesional

**Ejemplo de uso:**
```
/brand-guardian
Analiza este nuevo banner contra nuestro manual de marca.
¿Cumple con la jerarquía tipográfica y el tono de voz?
```

---

### 2. **Conversion Architect**
**Archivo:** `conversion-architect.md`

**¿Cuándo usarlo?**
- Tienes un brief confuso o apenas un concepto rough
- Necesitas estructurar un ad de Meta (Instagram, Facebook, Threads) para máxima conversión
- Quieres que Claude defina el layout antes de que el diseñador se siente a trabajar

**Lo que hace:**
- Estructura briefs aburridos en layouts de alta conversión
- Define el Hook Visual (0-3 segundos)
- Establece jerarquía de lectura (Patrón F vs. Z)
- Aplica regla del 20% de texto
- Justifica color del CTA con psicología del marketing

**Ejemplo de uso:**
```
/conversion-architect
Tengo este brief: "Campaña de Black Friday para tienda online de ropa deportiva".
Estructúrame el ad para Instagram Stories enfocado en conversión.
```

---

### 3. **Visual Prompt Engineer**
**Archivo:** `visual-prompt-engineer.md`

**¿Cuándo usarlo?**
- Necesitas briefear a tu diseñador pero no sabes cómo ser específico
- Quieres eliminar ambigüedad y reducir ciclos de revisión
- Tienes un objetivo comercial pero no una dirección visual clara

**Lo que hace:**
- Convierte objetivos comerciales en Wireframes Textuales
- Define composición exacta (regla de tercios, simetría, líneas guía)
- Especifica iluminación y mood con términos técnicos
- Establece distribución de pesos visuales (50-30-20)
- Documenta direccionalidad y eye-tracking

**Ejemplo de uso:**
```
/visual-prompt-engineer
Brieféame una foto de producto para headphones gamer.
Necesito un wireframe textual para que el fotógrafo no tenga dudas.
```

---

### 4. **Critical Auditor**
**Archivo:** `critical-auditor.md`

**¿Cuándo usarlo?**
- Antes de lanzar un anuncio quieres validar que no tenga fricciones visuales
- Un ad underperforms y necesitas diagnosticar si es diseño o targeting
- Quieres predecir ganador en test A/B sin esperar datos

**Lo que hace:**
- Ejecuta "Squint Test" para identificar puntos focales en competencia
- Valida distribución visual contra principios de Gestalt
- Mide carga cognitiva (¿se entiende en <2 segundos?)
- Propone recortes específicos (MVF - Mínimo Viable Feature)
- Genera reporte ejecutivo con veredicto de lanzamiento

**Ejemplo de uso:**
```
/critical-auditor
Revisa este anuncio. ¿Está listo para lanzar o tiene fricciones cognitivas?
```

---

## 🎯 Flujo Recomendado: De Briefing a Lanzamiento

```
1. BRIEF LLEGA
   ↓
2. Conversion Architect → Estructura el layout (si es Meta Ad)
   ↓
3. Visual Prompt Engineer → Genera wireframe textual para equipo
   ↓
4. Brand Guardian → Valida coherencia con marca existente
   ↓
5. [EQUIPO DISEÑA]
   ↓
6. Critical Auditor → Audita antes de publicar
   ↓
7. [LANZAMIENTO]
```

---

## 🔧 Integración en Tus Procesos

### Opción A: Terminal (Si usas Claude en CLI)
```bash
claude /brand-guardian "analiza [referencia]"
claude /conversion-architect "brief: [descripción]"
claude /visual-prompt-engineer "crear wireframe para [proyecto]"
claude /critical-auditor "auditar [referencia del diseño]"
```

### Opción B: Claude Code Sidebar
- Abre uno de los .md como skill
- Invócalo con `/[nombre-skill]` en el chat
- Proporciona tu contexto (referencias, briefs, diseños)

### Opción C: Prompt Injection en Nodos
Si tienes un sistema automatizado (Zapier, Make, webhooks):
```
Cuando llega un nuevo pedido al Trello:
1. Ejecuta Conversion Architect con el brief
2. Guarda output como template
3. Notifica al equipo de diseño
```

---

## 💡 Tips de Uso Avanzado

### Para Estandarizar Calidad
**Usa Visual Prompt Engineer en TODOS los briefs:**
- Reduce variabilidad en pedidos
- Acelera ejecución del equipo
- Documenta decisiones creativas

### Para Acelerar Feedback
**Combina Brand Guardian + Critical Auditor:**
- Brand Guardian valida marca
- Critical Auditor valida ejecución
- 2 pasadas = feedback completo en 2 minutos

### Para Mejorar Performance
**Usa Critical Auditor antes de lanzar:**
- Identifica fricciones que métrica no captura
- Ahorra presupuesto en test A/B malo
- Predice winners con análisis cognitivo

### Para Nuevos Diseñadores
**Usa Visual Prompt Engineer como "curriculum":**
- Enseña cómo pensar sobre composición
- Muestra por qué se toman ciertas decisiones
- Crea documentación reutilizable

---

## 📊 Matriz de Decisión: ¿Cuál Skill Necesito?

| Situación | Skill Recomendado |
|-----------|-------------------|
| "Entra brief aburrido" | Conversion Architect |
| "Necesito briefear a diseñador" | Visual Prompt Engineer |
| "¿Cumple con marca?" | Brand Guardian |
| "¿Está listo para lanzar?" | Critical Auditor |
| "A/B test underperforms" | Critical Auditor |
| "Quiero estandarizar proceso" | Visual Prompt Engineer |
| "Nuevo diseñador necesita entrenamiento" | Visual Prompt Engineer |
| "Advertencia de falta de conversión" | Conversion Architect + Critical Auditor |

---

## 📝 Notas Importantes

- **Todos los skills usan terminología profesional**: Esto sirve como educación incluso mientras se usan
- **Los outputs son ejecutables**: No son "sugerencias vagas", son instrucciones específicas
- **Se complementan entre sí**: Úsalos en secuencia para máxima calidad
- **Cero ambigüedad**: Cada skill está diseñado para eliminar "eso depende", todo es medible

---

## 🚀 Próximos Pasos

1. **Descarga los 4 archivos .md** a tu directorio de skills de Claude
2. **Invoca cada skill** con un ejemplo de tu portfolio
3. **Adapta los templates** a tu terminología interna
4. **Integra en tu flujo**: Zapier, Make, o CLI automation

**¡Listo! Ahora tienes un equipo de directores creativos dentro de Claude.**

---

## 📧 Soporte & Customización

Si necesitas adaptar algún skill:
- Edita el archivo .md correspondiente
- Cambia ejemplos por casos reales de tu agencia
- Ajusta terminología según tu brand language
- Reconecta en tus sistemas de automatización

**Última actualización:** 2026-03-19
