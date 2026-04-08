# 🎯 Workflow Guide - Custer AI Studio

**Versión**: 1.0
**Última actualización**: 2026-04-03
**Propósito**: Sistema de orquestación de tareas con planificación, verificación y lecciones aprendidas

---

## 📖 Tabla de Contenidos

1. [Overview](#overview)
2. [Flujo Estándar](#flujo-estándar)
3. [Roles de Agentes](#roles-de-agentes)
4. [Escalas de Prioridad](#escalas-de-prioridad)
5. [Guía por Fase](#guía-por-fase)
6. [Mejores Prácticas](#mejores-prácticas)
7. [FAQ](#faq)

---

## Overview

El workflow de Custer AI Studio sigue un ciclo de **5 fases**:

```
PLANIFICACIÓN → APROBACIÓN → IMPLEMENTACIÓN → VERIFICACIÓN → LECCIONES
```

**Objetivo**: Asegurar que cada tarea:
- ✅ Está bien planificada antes de ejecutar
- ✅ Es verificada contra estándares de calidad
- ✅ Genera lecciones para evitar errores futuros
- ✅ Se ejecuta en paralelo cuando es posible

---

## Flujo Estándar

### Fase 1: PLANIFICACIÓN (15-30 min)

**Cuándo**: Cualquier tarea no trivial (>1 cambio o >2 archivos)

**Cómo**:
1. Entrar en `EnterPlanMode`
2. Lanzar `Explore agent` (buscar, investigar)
   - Qué existe
   - Qué patrones se usan
   - Qué puede reutilizarse
3. Lanzar `Plan agent` (diseñar, proponer)
   - Arquitectura propuesta
   - Archivos a cambiar
   - Trade-offs
4. Escribir plan en `.claude/plans/[task-name].md`
5. Salir con `ExitPlanMode`

**Artifacts**:
- Plan file con contexto, objetivos, implementación
- Checklist de verificación
- Estimación de tiempo

---

### Fase 2: APROBACIÓN (5-15 min)

**Quién**: Usuario revisa el plan

**Qué revisar**:
- ¿El objetivo está claro?
- ¿La arquitectura es correcta?
- ¿Están identificados los archivos?
- ¿El timeline es realista?

**Opciones**:
- ✅ **Aprobar**: Plan está listo
- 🔄 **Modificar**: Usuario pide cambios, volver a Fase 1
- ❌ **Rechazar**: Cambiar enfoque completamente

---

### Fase 3: IMPLEMENTACIÓN PARALELA (30-120 min)

**Cómo**:
1. Lanzar hasta **3 agentes en paralelo**:
   - `general-purpose` o `Explore` para research
   - `general-purpose` para code changes
   - Más agentes si hay tareas independientes

2. **Coordinador** rastrea progreso:
   - Actualiza `todo.md` en tiempo real
   - Indica estado: pending → in_progress → completed
   - Marca bloqueadores

3. Merging de resultados:
   - Si modificaron el mismo archivo, merge cuidadoso
   - Sin conflictos esperados si se dividió bien

**Parallelization Rules**:
- Máximo 3 agentes simultáneamente
- Cada agente: tarea independiente
- Evitar: Agentes que modifican el mismo archivo

---

### Fase 4: VERIFICACIÓN (15-30 min)

**Qué revisar** (ver `tasks/verification-checklist.md`):

- [ ] **Código**
  - Tests pasan ✅
  - Sin console.error ✅
  - Sin TODOs sin resolver ✅
  - Code review: ¿está bien? ✅

- [ ] **Funcionalidad**
  - End-to-end funciona ✅
  - Edge cases manejados ✅
  - Error handling OK ✅
  - Performance OK ✅

- [ ] **Documentación**
  - README actualizado ✅
  - Cambios documentados ✅
  - APIs documentadas ✅
  - Ejemplos incluidos ✅

**Si todo ✅**: Pasar a Fase 5
**Si algo falla**: Regresar a Fase 3 (Fix + Re-verify)

---

### Fase 5: LECCIONES APRENDIDAS (10-15 min)

**Qué registrar**:
1. ¿Qué salió bien?
   - Patrones que funcionaron
   - Decisiones correctas

2. ¿Qué falló?
   - Errores encontrados
   - Problemas durante ejecución

3. ¿Cómo evitarlo?
   - Reglas preventivas
   - Actualizaciones a lessons.md
   - Nuevos checks en verification-checklist.md

**Cómo**:
1. Abrir `tasks/lessons.md`
2. Agregar sección nueva (si es patrón/error nuevo)
3. Incluir: problema, solución, código, resultado
4. Agregar a `verification-checklist.md` si es importante
5. Actualizar `todo.md` con lección

---

## Roles de Agentes

### RESEARCH_AGENT (Explore)
**Responsabilidad**: Investigar, entender, buscar patrones

**Herramientas**:
- Glob: buscar archivos
- Grep: buscar en contenido
- Read: leer archivos

**Deliverable**:
- "Encontré X patrones"
- "La solución existente usa Y"
- "Se recomienda Z"

**Tiempo**: 5-15 min

---

### ARCHITECT_AGENT (Plan)
**Responsabilidad**: Diseñar, proponer, validar arquitectura

**Herramientas**:
- Pen and paper (o editor de plan)
- Knowledge of existing patterns

**Deliverable**:
- Plan detallado
- Archivos a cambiar
- Checklist de verificación

**Tiempo**: 10-20 min

---

### IMPLEMENTER_AGENT (general-purpose)
**Responsabilidad**: Escribir código, hacer cambios, escribir tests

**Herramientas**:
- Write/Edit: cambiar código
- Bash: ejecutar comandos
- Read: leer código existente

**Deliverable**:
- Código implementado
- Tests pasando
- Documentación actualizada

**Tiempo**: 30-120 min (depende tarea)

---

### VERIFIER_AGENT (general-purpose)
**Responsabilidad**: Verificar, testear, validar

**Tareas**:
- Ejecutar verificación checklist
- Probar end-to-end
- Revisar documentación
- Validar que no hay regresiones

**Deliverable**:
- ✅ o ❌ en cada check
- Lista de issues si falla
- Lecciones aprendidas

**Tiempo**: 15-30 min

---

## Escalas de Prioridad

### Priority Levels

| Nivel | Símbolo | Significado | Tiempo | Ejemplo |
|-------|---------|-------------|--------|---------|
| BLOCKER | 🔴 | Impide uso del sistema | ASAP | API Key broken |
| HIGH | ⚠️ | Reduce funcionalidad | < 1 día | Major bug |
| MEDIUM | 🟡 | Mejora o fix menor | < 1 semana | UX improvement |
| LOW | 🟢 | Nice-to-have | < 1 mes | Refactor |

### Status Levels

```
pending    = No empezó
in_progress = Alguien trabaja en ello
completed  = Hecho y verificado
blocked    = Esperando por algo/alguien
```

---

## Guía por Fase

### Fase 1: PLANIFICACIÓN

**Preguntas a responder**:
- ¿Qué es el problema/feature?
- ¿Por qué es importante?
- ¿Qué archivos cambiarán?
- ¿Cuál es el diseño propuesto?
- ¿Qué podría salir mal?

**Plan template**:
```markdown
# Plan: [Task Name]

## Context
- Problema/oportunidad
- Por qué importa

## Objetivo
- Qué queremos lograr

## Propuesta de Arquitectura
- Alto nivel
- Archivos clave

## Archivos a Crear/Modificar
- Listado con detalles

## Verificación End-to-End
- Cómo probar que funciona
```

---

### Fase 3: IMPLEMENTACIÓN

**Workflow**:
1. Actualizar `todo.md` → `in_progress`
2. Hacer cambios en código
3. Tests lokales (si hay)
4. Actualizar documentación
5. Ejecutar build
6. Actualizar `todo.md` → `completed`

**Pro Tips**:
- Commit frequently (cada pequeña ganancia)
- Mensajes de commit descriptivos
- Si descubres lección, documenta inmediatamente
- Si encuentras blockeador, crea issue

---

### Fase 4: VERIFICACIÓN

**Checklist mínima** (siempre):
- [ ] Cambios compilados/parsed
- [ ] Sin console.error
- [ ] Feature funciona
- [ ] Documentación actualizada

**Checklist completa** (cuando aplica):
- Ver `tasks/verification-checklist.md`

**Si falla algo**:
1. Identificar la causa
2. Documentar en `lessons.md`
3. Implementar fix
4. Re-verificar (volver a empezar checklist)

---

### Fase 5: LECCIONES

**Template**:
```markdown
## [Error/Pattern Name]

**Problema**: Qué salió mal
**Causa raíz**: Por qué pasó
**Solución**: Cómo lo arreglamos
**Resultado**: Qué mejoró
**Aplicar a**: Otros endpoints/features
**Status**: IMPLEMENTADO / PENDIENTE

### Código de referencia
[snippet]

### Checklist de prevención
- [ ] Revisar X
- [ ] Validar Y
```

---

## Mejores Prácticas

### 1. Planificación

✅ **DO**:
- Entrar en EnterPlanMode para tareas no triviales
- Usar Explore agent para investigar
- Escribir plan claro con archivos específicos

❌ **DON'T**:
- Saltar planeación y empezar a codear
- Hacer plan muy largo y teórico
- Planear lo que ya sabes

---

### 2. Implementación

✅ **DO**:
- Commits pequeños y descriptivos
- Tests primero (TDD) si es apropiado
- Documentación mientras codeas

❌ **DON'T**:
- Cambios mega commitados
- Código sin documentar
- Breaking changes sin avisar

---

### 3. Verificación

✅ **DO**:
- Usar checklist de verificación
- Probar casos felices Y edge cases
- Validar documentación

❌ **DON'T**:
- Solo probar "happy path"
- Asumir que funciona sin verificar
- Saltear documentación

---

### 4. Lecciones

✅ **DO**:
- Documentar todo aprendizaje
- Ser específico (no genérico)
- Incluir código de referencia

❌ **DON'T**:
- Aprender y no documentar
- Lecciones sin ejemplos
- Patrones que nadie puede reutilizar

---

## FAQ

### P: ¿Cuándo usar EnterPlanMode?
**R**: Para cualquier tarea que:
- Toca > 2 archivos
- Cambia arquitectura
- Es no trivial (> 30 min)
- Tiene incertidumbre

Skip para: typos, 1-line fixes, cambios obvios

---

### P: ¿Cuántos agentes lanzar en paralelo?
**R**: Máximo 3. Criterio:
- 1 agent: Tarea pequeña y clara
- 2 agents: Dos subtareas independientes
- 3 agents: Three independent subtasks

No lanzar > 3 para evitar chaos.

---

### P: ¿Qué hacer si verificación falla?
**R**: Flujo:
1. Documentar el fallo en lessons.md
2. Identificar causa raíz
3. Implementar fix
4. Re-verificar
5. Loop hasta pasar

No marcar DONE hasta pasar verificación.

---

### P: ¿Cómo actualizar lecciones?
**R**: Después de Fase 5:
1. Abrir `tasks/lessons.md`
2. Si es nuevo patrón/error:
   - Crear sección
   - Incluir problema, solución, código
3. Si es mejora a existente:
   - Actualizar sección
4. Si es para prevenir:
   - Agregar a `verification-checklist.md`

---

### P: ¿Puedo saltarme una fase?
**R**: No. Pero puedes comprimir:
- Fases 1+2: Planificación rápida (si obvio)
- Fase 3: Puede ser 30 min si simple
- Fase 4: Siempre, aunque sea 5 min
- Fase 5: Siempre, aunque sea 2 min

Mínimo 5 min total. Si menos, era tarea trivial y necesitaba checklist, no plan.

---

### P: ¿Quién aprueba el plan?
**R**: Usuario (tú). Yo propongo, tú revisas y apruebas.

---

### P: ¿Cómo reporto blockeadores?
**R**: En `todo.md`:
```
- [ ] Task X
  - Estado: blocked
  - Bloqueador: Esperando fix de Task Y
  - ETA: Cuando Task Y esté done
```

---

### P: ¿Los archivos del workflow se versionan?
**R**: Parcialmente:
- ✅ `lessons.md` → SÍ, versionado
- ✅ `todo.md` → SÍ, histórico útil
- ❌ `verification-checklist.md` → NO, versionable pero vive localmente
- ✅ `WORKFLOW_GUIDE.md` → SÍ, versionado

Todos en `/tasks` se agregan a `.gitignore` excepto `lessons.md`

---

## 🚀 Próximos Pasos

1. Leer este documento
2. Abrir `todo.md` y elegir una tarea
3. Si tarea es no trivial:
   - EnterPlanMode
   - Explore + Plan agents
   - ExitPlanMode
4. Implementar
5. Verificar
6. Documentar lección
7. Marcar ✅ en todo.md

---

**¿Preguntas?** Consulta `lessons.md` o revisa `verification-checklist.md`

**Última actualización**: 2026-04-03
