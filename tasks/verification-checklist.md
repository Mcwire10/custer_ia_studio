# ✅ Verificación Pre-Finalización

**Propósito**: Asegurar que toda tarea cumple estándares de calidad antes de marcar como "done"

**Aplicar a**: Cada tarea en todo.md cuando está lista para completar

---

## 🔍 Verificación de Código

- [ ] **Tests pasan localmente**
  - [ ] Si hay tests unitarios, todos pasan
  - [ ] Si hay tests e2e, todos pasan
  - [ ] Sin skipped tests
  - [ ] Coverage >= 80% si aplica

- [ ] **Sin console.error o console.warn**
  - [ ] Abrir DevTools → Console
  - [ ] No hay errores rojos
  - [ ] No hay warnings amarillos
  - [ ] Logs de DEBUG pueden existir

- [ ] **Sin TODO comments sin resolver**
  - [ ] grep -r "TODO\|FIXME" app/
  - [ ] Si hay TODOs, están en backlog
  - [ ] Usar: `// TODO [Epic X.X]: descripción`

- [ ] **Diff review: ¿está bien?**
  - [ ] Cambios son mínimos y necesarios
  - [ ] No hay código dead/comentado
  - [ ] Sin cambios accidentales
  - [ ] Naming es claro

---

## 🎯 Verificación de Funcionalidad

- [ ] **Feature funciona end-to-end**
  - [ ] Caso feliz: funciona como se espera
  - [ ] Usuario puede completar flujo sin errores
  - [ ] Resultado es correcto

- [ ] **Edge cases están manejados**
  - [ ] Input vacío/null → error graceful
  - [ ] Input inválido → error claro
  - [ ] Timeout/network error → manejo
  - [ ] API error → fallback o user message

- [ ] **Error handling está implementado**
  - [ ] try-catch en async/await
  - [ ] API calls con validación de response.ok
  - [ ] User-facing errors son amigables
  - [ ] Logs técnicos incluyen contexto

- [ ] **Performance es aceptable**
  - [ ] Endpoint responde < 5s (normal)
  - [ ] Endpoint responde < 10s (complejo)
  - [ ] Sin memory leaks
  - [ ] UI no freezes durante operaciones

---

## 📚 Verificación de Documentación

- [ ] **README actualizado**
  - [ ] Si cambié cómo usar, actualicé README
  - [ ] Si agregué endpoint, está documentado
  - [ ] Ejemplos son correctos

- [ ] **Cambios documentados en código**
  - [ ] Comments explican "why", no "what"
  - [ ] Funciones complejas tienen JSDoc
  - [ ] Trade-offs están explicados

- [ ] **Ejemplos incluidos**
  - [ ] Request/response examples si es API
  - [ ] Uso examples si es librería
  - [ ] Casos de uso claros

- [ ] **APIs documentadas**
  - [ ] Parámetros descritos
  - [ ] Tipos especificados
  - [ ] Errores posibles listados

---

## 🧠 Verificación de Lecciones

- [ ] **Errores registrados en lessons.md**
  - [ ] Si encontré un bug, lo documenté
  - [ ] Si encontré patrón de fallo, está aquí
  - [ ] Incluí solución y dónde aplicarla

- [ ] **Patrones capturados**
  - [ ] Si encontré buen patrón, lo documenté
  - [ ] Incluí ejemplos de código
  - [ ] Expliqué por qué es bueno

- [ ] **Reglas preventivas creadas**
  - [ ] Si fue error crítico, agregué a checklist
  - [ ] Si fue warning, agregué validation
  - [ ] Si fue pattern, agregué a lessons.md

- [ ] **Team notificado**
  - [ ] Pull request con buena description
  - [ ] Lecciones compartidas con equipo
  - [ ] Patrones nuevos documentados

---

## ⭐ Standard Senior Engineer

- [ ] **¿Aprueba esto un Staff Engineer?**
  - [ ] Código es limpio y mantenible
  - [ ] Decisiones tienen sentido
  - [ ] No hay "magic" unexplained

- [ ] **¿Es elegante o es un parche?**
  - [ ] Solución es robusta
  - [ ] No es workaround temporal
  - [ ] Escalará bien

- [ ] **¿Se puede refactorizar?**
  - [ ] DRY: No hay código duplicado
  - [ ] Funciones tienen una responsabilidad
  - [ ] Naming es claro

- [ ] **¿Es el mínimo cambio posible?**
  - [ ] No cambié cosas innecesarias
  - [ ] Scope está bien definido
  - [ ] No agregué features no pedidas

---

## 🧪 Verificación Específica por Tipo

### Si cambié un Endpoint API

- [ ] Request schema es válido
- [ ] Response schema es válido
- [ ] Error responses tienen formato consistente
- [ ] getApiKey() si usa Anthropic API
- [ ] logTokenUsage() si es endpoint de IA
- [ ] Modelo es claude-3-5-haiku-20241022
- [ ] HTTP status codes son correctos

### Si cambié UI/Frontend

- [ ] Funciona en Chrome/Firefox/Safari
- [ ] Responsive: mobile (375px) y desktop (1280px)
- [ ] Sin console errors
- [ ] Accesibilidad básica (alt text, labels)
- [ ] Performance: sin lag en interacciones
- [ ] Diseño sigue Nothing Design System

### Si cambié Lógica/Librería

- [ ] Unit tests pasan
- [ ] Función tiene JSDoc
- [ ] Edge cases están cubiertos
- [ ] Errores son específicos
- [ ] Compatible con código existente

### Si cambié Documentación

- [ ] Markdown válido (sin syntax errors)
- [ ] Links funcionan
- [ ] Ejemplos de código están actualizados
- [ ] Comparé con realidad del código

---

## 🚀 Deployment Checklist

Antes de hacer commit/push:

- [ ] Ejecuté: `npm run build` (sin errores)
- [ ] Ejecuté: `npm run dev` (compila OK)
- [ ] Probé en browser (funciona)
- [ ] Limpié logs de debug
- [ ] Sin API keys o secrets en código
- [ ] Version numbers actualizados si aplica

---

## 🎬 Cómo Usarlo

### Paso 1: Tarea Completada
Cuando termines una tarea:
```
- [x] Task X.X: Descripción
  - Completado: Breve resumen
```

### Paso 2: Pre-Finalizacion
Antes de marcar DONE:
1. Abre este checklist
2. Copia la sección relevante
3. Completa cada check
4. Si todo está ✅, puedes marcar DONE
5. Si algo falla, regresa a implementación

### Paso 3: Actualizar Lessons
Después de verificar:
1. ¿Aprendiste algo nuevo?
2. Agrega a `lessons.md`
3. Crea regla preventiva si es error

---

## 📊 Métricas de Calidad

| Métrica | Goal | Actual |
|---------|------|--------|
| Tests passing | 100% | ? |
| Console errors | 0 | ? |
| Code coverage | 80% | ? |
| Performance (endpoint) | < 5s | ? |
| Documentation | 100% | ? |
| Error handling | 100% | ? |

---

**Last Updated**: 2026-04-03
**Owner**: System Agent
