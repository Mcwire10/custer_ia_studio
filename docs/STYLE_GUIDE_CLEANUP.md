# 🎨 Style Guide - Aplicar UI/UX Limpio a Toda la App

## **Colores & Paleta**

```css
:root {
  /* Primary Gradient */
  --primary: #667eea;
  --primary-dark: #5a6dd6;
  --primary-light: #7c8ff0;

  /* Secondary Gradient */
  --secondary: #764ba2;
  --secondary-dark: #6a3f96;
  --secondary-light: #8557b3;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-hover: linear-gradient(135deg, #5a6dd6 0%, #6a3f96 100%);

  /* Neutrals */
  --white: #ffffff;
  --dark: #333333;
  --gray-light: #f8f9ff;
  --gray-border: #eeeeee;
  --gray-placeholder: #cccccc;
  --gray-text: #666666;
  --gray-meta: #999999;

  /* States */
  --success: #4caf50;
  --success-light: #e8f5e9;
  --error: #f44336;
  --error-light: #ffebee;
  --warning: #ff9800;
  --warning-light: #fff3e0;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Courier New', monospace;
}
```

---

## **Tipografía**

```css
/* Headings */
h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--dark);
  margin-bottom: 12px;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: var(--dark);
  margin-bottom: 12px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 8px;
}

/* Body */
body, p {
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-text);
}

/* Labels & Meta */
label, .label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary);
}

.meta {
  font-size: 11px;
  color: var(--gray-meta);
}
```

---

## **Componentes Base**

### **Botones**

```css
/* Primary Button */
.btn-primary {
  padding: 12px 24px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Secondary Button */
.btn-secondary {
  padding: 12px 24px;
  background: var(--gray-light);
  color: var(--dark);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--gray-border);
}

/* Small Button */
.btn-small {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-confirm { background: var(--success); color: white; }
.btn-edit { background: var(--primary); color: white; }
.btn-reject { background: var(--gray-light); color: var(--dark); }
```

---

### **Inputs & Forms**

```css
/* Input Field */
input[type="text"],
input[type="email"],
input[type="url"],
textarea,
select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-family);
  transition: all 0.3s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input::placeholder {
  color: var(--gray-placeholder);
}

/* Floating Label Pattern */
.input-group {
  position: relative;
  margin-bottom: 12px;
}

.input-group label {
  position: absolute;
  left: 16px;
  top: -8px;
  background: white;
  padding: 0 4px;
}

/* Checkbox/Radio */
input[type="checkbox"],
input[type="radio"] {
  cursor: pointer;
  margin-right: 8px;
}
```

---

### **Cards & Containers**

```css
/* Card */
.card {
  background: white;
  border: 1px solid var(--gray-border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Section */
.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .icon {
  font-size: 18px;
}

/* Container */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

@media (max-width: 600px) {
  .container {
    padding: 24px;
  }
}
```

---

### **Messages & Alerts**

```css
/* Error Message */
.error-message,
.alert-error {
  background: var(--error-light);
  color: var(--error);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: none;
}

.error-message.show {
  display: block;
}

/* Success Message */
.success-message,
.alert-success {
  background: var(--success-light);
  color: var(--success);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: none;
}

.success-message.show {
  display: block;
}

/* Info Message */
.info-message,
.alert-info {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
}
```

---

### **Progress & Loading**

```css
/* Progress Bar */
.progress {
  width: 100%;
  height: 6px;
  background: var(--gray-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
}

/* Skeleton Loader */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  height: 16px;
  margin-bottom: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid var(--gray-border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## **Aplicar a studio-v2.html**

### **1. Agregar Estilos Base**
En `<head>` de studio-v2.html:

```html
<style>
  :root {
    --primary: #667eea;
    --secondary: #764ba2;
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --white: #ffffff;
    --dark: #333333;
    --gray-light: #f8f9ff;
    --gray-border: #eeeeee;
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family);
    background: #f5f5f5;
    color: var(--dark);
  }

  button {
    font-family: var(--font-family);
    cursor: pointer;
  }

  input, textarea, select {
    font-family: var(--font-family);
  }
</style>
```

### **2. Actualizar Elementos**

**Antes (actual):**
```html
<button style="background: blue; padding: 10px;">Click</button>
```

**Después (limpio):**
```html
<button class="btn-primary">Click</button>
```

### **3. Aplicar a Secciones Principales**

```
NAVBAR/HEADER
├─ Logo + nav links (gradient bar)
├─ Color: gradient-primary
└─ Estilo: clean, minimal

TABS (Generator, Validator, Brain, etc)
├─ Botones limpios sin borders
├─ Active: color primary + underline
└─ Hover: background gray-light

FORMS (Inputs, Selects)
├─ Floating labels
├─ Focus: blue border + shadow
└─ Spacing: 12px gaps

PANELS (Results, Preview)
├─ White cards con 1px border
├─ Hover: subtle shadow
└─ Padding: 16px consistent

BUTTONS
├─ Primary: gradient color
├─ Secondary: gray background
└─ Sizes: btn-primary, btn-secondary, btn-small
```

---

## **Responsive Breakpoints**

```css
/* Mobile First */
@media (max-width: 600px) {
  .container { padding: 24px 16px; }
  h1 { font-size: 22px; }
  button { padding: 10px 16px; }
  .btn-group { flex-direction: column; }
}

/* Tablet */
@media (min-width: 600px) and (max-width: 1000px) {
  .container { padding: 32px; }
}

/* Desktop */
@media (min-width: 1000px) {
  .container { max-width: 1200px; }
  .grid { display: grid; gap: 20px; }
}
```

---

## **Estructura HTML Recomendada**

```html
<!-- Header con nav limpio -->
<header style="background: var(--gradient-primary); color: white; padding: 16px;">
  <div class="container">
    <h1>🎨 Custer AI Studio</h1>
  </div>
</header>

<!-- Main content -->
<main style="background: white; margin: 20px 0;">
  <div class="container">
    <!-- Tabs -->
    <div style="display: flex; border-bottom: 1px solid var(--gray-border);">
      <button class="tab active">Generator</button>
      <button class="tab">Validator</button>
      <button class="tab">Brain</button>
    </div>

    <!-- Content -->
    <div class="section">
      <div class="section-title">📸 Carga Imágenes</div>
      <input type="file" class="form-input">
      <button class="btn-primary">Analizar</button>
    </div>
  </div>
</main>

<!-- Footer -->
<footer style="background: var(--gray-light); padding: 20px;">
  <div class="container" style="text-align: center; color: var(--gray-text);">
    <p>© 2026 Custer AI Studio. Hecho por agentes.</p>
  </div>
</footer>
```

---

## **Checklist de Aplicación**

- [ ] Agregar `:root` variables a studio-v2.html
- [ ] Reemplazar botones hardcodeados con clases
- [ ] Actualizar inputs con floating labels
- [ ] Aplicar card styling a panels
- [ ] Agregar progress bars + spinners
- [ ] Revisar responsive en mobile
- [ ] Testear en Chrome, Safari, Firefox
- [ ] Remover estilos inline innecesarios
- [ ] Documenten paleta de colores

---

## **Resultado Final**

**Antes**: UI confusa, colores random, inconsistente

**Después**:
- ✅ Gradient primary (#667eea → #764ba2)
- ✅ Tipografía limpia y legible
- ✅ Espaciado consistent (12px, 16px, 20px, 24px)
- ✅ Botones modernos con hover states
- ✅ Inputs con floating labels
- ✅ Cards con subtle shadows
- ✅ Responsive en todos los dispositivos
- ✅ Accesible y amigable

**= App profesional y intuitiva**

