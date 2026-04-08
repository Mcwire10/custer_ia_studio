# 🔄 Workflow Detallado - 5 Fases

**Guía completa paso a paso para ejecutar tareas**

---

## 🎯 Filosofía

Este workflow está diseñado para:
- ✅ Planificar antes de codificar
- ✅ Validar arquitectura con expertos (agentes)
- ✅ Ejecutar tareas en paralelo cuando sea posible
- ✅ Verificar cada cambio
- ✅ Capturar lecciones aprendidas

---

## 🔀 Las 5 Fases

```
FASE 1: PLANIFICACIÓN
↓ (15-30 min)
FASE 2: APROBACIÓN
↓ (5-15 min)
FASE 3: IMPLEMENTACIÓN
↓ (30-120 min)
FASE 4: VERIFICACIÓN
↓ (15-30 min)
FASE 5: LECCIONES
↓ (10-15 min)
✅ TAREA COMPLETADA
```

---

## FASE 1: PLANIFICACIÓN ✍️

**Objetivo**: Entender la tarea y diseñar la solución

### Paso 1: Usar EnterPlanMode

```bash
# Comando (automático):
EnterPlanMode
```

Esto:
- Te pone en modo de lectura solamente
- No puedes hacer cambios en código
- Enfocado en exploración y diseño

### Paso 2: Explorar el Código (Explore Agents)

Lanza hasta 3 **Explore agents** en paralelo para:

**Agent 1: Investigación de Features Existentes**
```
Busca: ¿Existe algún código similar? ¿Qué patrones se usan?
Devuelve: Ubicaciones de código, funciones reutilizables
```

**Agent 2: Análisis de Arquitectura**
```
Busca: ¿Cómo está estructurado? ¿Dónde insertar cambios?
Devuelve: Archivos críticos, puntos de inyección
```

**Agent 3: Investigación de Dependencias**
```
Busca: ¿Qué depende de qué? ¿Qué se rompe si cambio esto?
Devuelve: Dependencias, impactos, riesgos
```

### Paso 3: Crear el Plan File

Escribe `/Users/leandromoyano/.claude/plans/delightful-puzzling-thunder.md`:

```markdown
# 📝 Plan: [Nombre de la Tarea]

## CONTEXTO
- ¿Por qué hacemos esto?
- ¿Qué problema resuelve?
- ¿Quién se beneficia?

## OBJETIVO
- 1-2 frases claras de qué lograr

## PLAN DE IMPLEMENTACIÓN
- Qué archivos cambiar
- Qué líneas de código tocar
- Qué funciones crear/modificar
- Arquitectura clara

## VERIFICACIÓN
- Cómo probar que funciona
- Checklist de test
- Métricas de éxito

## TIMELINE
- Tiempo estimado por parte
- Total estimado
```

### ✅ Fase 1 Completada Cuando:
- [ ] Entiendes la tarea completamente
- [ ] Identificaste archivos a cambiar
- [ ] Redactaste plan en plan file
- [ ] Plan tiene arquitectura clara

**Comando para avanzar**: `ExitPlanMode` (ver abajo)

---

## FASE 2: APROBACIÓN 👤

**Objetivo**: Validar el plan con el usuario

### Paso 1: Presentar el Plan

Cuando ejecutes `ExitPlanMode`, el sistema:
- Muestra el plan al usuario
- Espera aprobación

### Paso 2: Esperar Feedback

Usuario puede:
- ✅ Aprobar: "Procede"
- ❌ Pedir cambios: "Esto no, mejor esto otro"

**Si pide cambios**:
- Vuelves a EnterPlanMode
- Modificas el plan
- Vuelves a ExitPlanMode

### ✅ Fase 2 Completada Cuando:
- [ ] Usuario aprueba el plan

---

## FASE 3: IMPLEMENTACIÓN 💻

**Objetivo**: Ejecutar el código según el plan aprobado

### Regla de Oro: Paralelo > Secuencial

Si hay tareas sin dependencias:
```
MEJOR: 3 agentes en paralelo (30 min)
PEOR: 3 agentes secuenciales (90 min)
```

### Paso 1: Leer el Código Actual

```bash
Read: /path/to/file.js
```

**Por qué**: Necesitas entender el contexto antes de editar

### Paso 2: Hacer Cambios Mínimos

**Regla**: "Mínimo código necesario"

```javascript
// ❌ MALO: Reescribir todo
async function validateFullContent(text) {
  // 200 líneas nuevas
}

// ✅ BUENO: Agregar lo mínimo
async function validateInRealTime(text) {
  // 65 líneas nuevas
  // Reutiliza /api/validate existente
}
```

### Paso 3: Agregar Tests/Verificaciones

**Inline testing** (sin archivo test):
```javascript
// Al final del cambio:
console.log('✅ validateInRealTime loaded')
// Probar manualmente en browser
```

### Paso 4: Documentar Cambios

En comentarios:
```javascript
// ============= VALIDACIÓN EN TIEMPO REAL =============
// Agregado: 2026-04-04
// Propósito: Feedback visual mientras escribes
// Debounce: 800ms para no saturar API
```

### ✅ Fase 3 Completada Cuando:
- [ ] Código escrito según plan
- [ ] Cambios compilados sin errores
- [ ] Tests manuales pasan
- [ ] Se ve en preview

---

## FASE 4: VERIFICACIÓN 🧪

**Objetivo**: Confirmar que todo funciona

### Paso 1: Test de Código

```javascript
// Abrir console en browser (F12)
// Ejecutar: validateInRealTime('test content')
// Verificar: No hay errores, funciona
```

### Paso 2: Test de Funcionalidad

**Checklist** (del plan):
- [ ] Feature funciona end-to-end
- [ ] No hay console.error
- [ ] Performance aceptable
- [ ] Responsive en móvil

### Paso 3: Test de Integración

**¿Rompe algo existente?**
```bash
# Verificar:
- Otros módulos todavía funcionan
- No hay efectos secundarios
- Datos se persisten correctamente
```

### Paso 4: Actualizar Documentación

```bash
# Actualizar:
- tasks/todo.md - Marcar como completada
- tasks/lessons.md - Agregar lecciones
- docs/ - Documentar cambios si es needed
```

### ✅ Fase 4 Completada Cuando:
- [ ] Todos los tests pasan
- [ ] Sin errores de console
- [ ] Documentación actualizada
- [ ] Checklist verificación completa

---

## FASE 5: LECCIONES 🎓

**Objetivo**: Aprender del trabajo realizado

### Paso 1: ¿Qué Salió Bien?

```markdown
## ✅ Lo que salió bien
- Exploración paralela ahorró 30 min
- Reutilizar API existente fue smart
- Plan detallado evitó cambios de dirección
```

### Paso 2: ¿Qué Fue Difícil?

```markdown
## ⚠️ Desafíos
- Event listeners con debounce necesitaba testing
- CSS positioning en mobile fue tricky
- Solución: Usar media queries más simplificadas
```

### Paso 3: ¿Qué Aprendimos?

```markdown
## 🎓 Lecciones
- Debounce es crítico para validación en tiempo real
- Reutilizar funciones > duplicar código
- UI feedback instantáneo importa más que lógica perfecta
```

### Paso 4: Guardar en tasks/lessons.md

```bash
# Agregar a tasks/lessons.md:
### 7. [Nombre de la Lección]
**Patrón**: [Qué usar]
**Problema**: [Cuándo aplica]
**Solución**: [Cómo hacerlo]
**Dónde**: [Archivo y línea de ejemplo]
```

### ✅ Fase 5 Completada Cuando:
- [ ] Escribiste 2-3 lecciones
- [ ] Actualizaste tasks/lessons.md
- [ ] Documentaste patrones reutilizables

---

## 📋 Checklist por Tipo de Tarea

### Feature Pequeña (<1 día)
```
Fase 1: 15 min (plan simple)
Fase 2: 5 min (aprobación rápida)
Fase 3: 45 min (código + tests)
Fase 4: 10 min (verificación básica)
Fase 5: 5 min (notas rápidas)
Total: ~80 min
```

### Feature Mediana (1-3 días)
```
Fase 1: 30 min (explore agents)
Fase 2: 15 min (feedback)
Fase 3: 90 min (múltiples archivos)
Fase 4: 30 min (tests exhaustivos)
Fase 5: 15 min (documentación)
Total: ~180 min (3 horas)
```

### Refactoring Grande (3+ días)
```
Fase 1: 60 min (arquitectura compleja)
Fase 2: 30 min (validación de design)
Fase 3: 240 min (múltiples iteraciones)
Fase 4: 60 min (tests completos + regression)
Fase 5: 30 min (documentación + training)
Total: ~420 min (7 horas)
```

---

## 🤖 Cuándo Usar Qué Agentes

### Explore Agent
**Cuándo**: Fase 1 (exploración)
**Para qué**: Investigar código existente, patrones, arquitectura
**Resultado**: Información estructurada, ubicaciones exactas

### Plan Agent
**Cuándo**: Fase 1 (después de Explore)
**Para qué**: Diseñar arquitectura, validar approach
**Resultado**: Plan detallado, consideración de trade-offs

### General Purpose Agent
**Cuándo**: Fase 3 (implementación)
**Para qué**: Escribir código, hacer cambios
**Resultado**: Código funcional, tests

### (No hay Verify Agent automático)
**Manual**: Tú ejecutas Phase 4 verificación

---

## 💡 Tips & Tricks

### Tip 1: Paralelizar Tareas
```
❌ Hacer Task1, Task2, Task3 secuencial
✅ Hacer Task1 + Task3 en paralelo (sin deps)
```

### Tip 2: Reutilizar Código
```javascript
// ❌ Crear función nueva
async function fetchValidation(text) { ... }

// ✅ Reutilizar función existente
await fetch('/api/validate', { body: {...} })
```

### Tip 3: Documentar Mientras Codificas
```javascript
// Al lado del código:
// Agregado: 2026-04-04
// Propósito: ...
// Debounce: 800ms
```

### Tip 4: Test Temprano
```javascript
// No esperar a Fase 4
// Probar inmediatamente en browser
// F12 → Console → ejecutar función
```

### Tip 5: Plan Conciso
```markdown
❌ Plan de 50 páginas
✅ Plan de 3-5 páginas con lo esencial
```

---

## ❓ FAQ

**P: ¿Puedo saltarme Fase 1?**
A: Solo para cambios triviales (<5 líneas). Para todo lo demás: planifica.

**P: ¿Cuánto tiempo toma todo?**
A: Depende. Feature pequeña: 80 min. Mediana: 3 horas. Grande: 7+ horas.

**P: ¿Qué si el plan falla?**
A: Vuelve a Fase 1, revisa el plan, sigue adelante. No es "fracaso", es iteración.

**P: ¿Necesito escribir tests?**
A: Sí. Mínimo: tests manuales. Ideal: tests automáticos si es lógica crítica.

**P: ¿Cómo sé si mi verificación es suficiente?**
A: Si: ejecutaste manualmente todas las paths, no hay console.error, y los datos persisten.

---

**Próximo paso?** Revisa [EXAMPLES.md](./EXAMPLES.md) para ver 3 tareas reales ejecutadas con este workflow.
