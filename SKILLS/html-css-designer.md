---
name: HTML/CSS Designer
description: Genera código HTML/CSS completo para mockups de piezas que respeten el Brand Profile de Custer
type: system
tags: [design, html, css, mockup, visual-design]
---

# HTML/CSS Designer - Mockups Interactivos

## Objetivo

Toma el **Brand Profile + Wireframe + Copy** y genera **código HTML/CSS completo** que:
- ✅ Respeta 100% el Brand Profile de Custer
- ✅ Se ve exactamente como el wireframe propone
- ✅ Es editable y funcional
- ✅ Se abre directamente en navegador
- ✅ Genera TODAS las plaques (carrusel)

## Cómo Funciona

### **ENTRADA**
```
Wireframe Textual + Copy de las plaques
```

### **SALIDA**
```
Código HTML/CSS listo para copiar-pegar y abrir en navegador
```

---

## 🎨 ESPECIFICACIONES TÉCNICAS (Brand Profile Custer)

```
COLORES (CSS):
--primary-blue: #4F46E5       (fondo principal)
--accent-yellow: #FCD34D      (CTAs, énfasis)
--text-white: #FFFFFF         (títulos, contraste)
--text-dark: #1E3A8A          (body en cajas)
--accent-gradient: linear-gradient(135deg, #C084FC, #E879F9) (rosa-purple esquina)

TIPOGRAFÍA:
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Headlines: font-weight: 700 (bold), font-size: 2.5rem-4rem
Body: font-weight: 400 (regular), font-size: 1rem-1.25rem

ESPACIADO:
padding: 2rem-3rem (breathing room)
gap: 1.5rem-2rem (entre elementos)
line-height: 1.5-1.6 (tipografía)

COMPONENTES:
Botones: border-radius: 24px, background: var(--accent-yellow)
Contenedores: border-radius: 16px, background: white
Card: box-shadow: 0 10px 40px rgba(0,0,0,0.1)
```

---

## 📝 TEMPLATE HTML/CSS

### **Estructura Base (para cada placa)**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custer - Placa [X]</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-blue: #4F46E5;
            --accent-yellow: #FCD34D;
            --text-white: #FFFFFF;
            --text-dark: #1E3A8A;
            --accent-gradient: linear-gradient(135deg, #C084FC, #E879F9);
            --neutral-gray: #6B7280;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: hidden;
        }

        /* CONTAINER PRINCIPAL */
        .placa {
            width: 100vw;
            height: 100vh;
            background: var(--primary-blue);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 2rem;
            position: relative;
            overflow: hidden;
        }

        /* GRADIENTE DECORATIVO (esquina superior derecha) */
        .placa::before {
            content: '';
            position: absolute;
            top: -100px;
            right: -100px;
            width: 300px;
            height: 300px;
            background: var(--accent-gradient);
            border-radius: 50%;
            opacity: 0.3;
            z-index: 0;
        }

        /* CONTENIDO (z-index mayor que gradiente) */
        .content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            max-width: 90%;
            gap: 1.5rem;
        }

        /* HEADLINE */
        .headline {
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.2;
            color: var(--accent-yellow);
            word-spacing: 0.1em;
            letter-spacing: -0.02em;
        }

        /* ALTERNATE: Si hay blanco + amarillo */
        .headline .white {
            color: var(--text-white);
            display: block;
        }

        /* SUBTITLE */
        .subtitle {
            font-size: 1.25rem;
            font-weight: 400;
            line-height: 1.6;
            color: var(--text-white);
            max-width: 600px;
        }

        /* CAJA DE INFO (contenedor blanco) */
        .info-box {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            margin: 1.5rem 0;
            text-align: left;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            max-width: 600px;
        }

        .info-box h3 {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 1rem;
        }

        .info-box p {
            font-size: 1rem;
            color: var(--neutral-gray);
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }

        .info-box ul {
            list-style: none;
            margin-top: 1rem;
        }

        .info-box li {
            font-size: 1rem;
            color: var(--text-dark);
            margin: 0.5rem 0;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .info-box li::before {
            content: '•';
            color: var(--text-dark);
            font-weight: bold;
            flex-shrink: 0;
        }

        /* BOTÓN CTA */
        .cta-button {
            background: var(--accent-yellow);
            color: var(--primary-blue);
            border: none;
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
            font-weight: 700;
            border-radius: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1.5rem;
            box-shadow: 0 10px 30px rgba(252, 211, 77, 0.3);
            font-family: 'Inter', sans-serif;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(252, 211, 77, 0.4);
        }

        /* ELEMENTOS 3D/DECORATIVOS */
        .decoration {
            position: absolute;
            width: 150px;
            height: 150px;
            background: rgba(196, 132, 252, 0.2);
            border-radius: 50%;
            z-index: 0;
        }

        .decoration.bottom-left {
            bottom: -50px;
            left: -50px;
        }

        .decoration.top-right {
            top: -50px;
            right: -50px;
        }

        /* FOOTER LOGO */
        .footer {
            position: absolute;
            bottom: 2rem;
            left: 2rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-yellow);
            z-index: 10;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
            .headline {
                font-size: 2.25rem;
            }

            .subtitle {
                font-size: 1rem;
            }

            .info-box {
                padding: 1.5rem;
                max-width: 95%;
            }

            .placa {
                padding: 1rem;
            }

            .content {
                max-width: 100%;
            }
        }
    </style>
</head>
<body>

<!-- PLACA [X] -->
<div class="placa">
    <div class="decoration top-right"></div>
    <div class="decoration bottom-left"></div>

    <div class="content">
        <!-- HEADLINE -->
        <h1 class="headline">
            Tu empresa vende.<br>
            <span class="white">Pero tu marca está desordenada.</span>
        </h1>

        <!-- SUBTITLE -->
        <p class="subtitle">
            Y eso limita cuánto podés crecer.
        </p>

        <!-- OPCIONAL: INFO BOX -->
        <div class="info-box">
            <h3>Señales claras de desorden:</h3>
            <ul>
                <li>No hay criterios visuales definidos.</li>
                <li>El tono cambia según quién comunique.</li>
                <li>Si todo se decide en el momento, no hay dirección.</li>
            </ul>
        </div>
    </div>

    <!-- CTA BUTTON -->
    <button class="cta-button">Conocé nuestro enfoque</button>

    <!-- FOOTER LOGO -->
    <div class="footer">custer</div>
</div>

</body>
</html>
```

---

## 🎯 INSTRUCCIONES DE GENERACIÓN

Para CADA PLACA del carrusel, genera:

1. **HTML completo** (copy exacto, estructura clara)
2. **CSS integrado** (respeta Brand Profile 100%)
3. **Elementos visuales** (colores, gradientes, botones)
4. **Responsive** (funciona en mobile, tablet, desktop)

---

## 📋 CHECKLIST PER PLACA

```
✓ Color fondo: Azul Royal (#4F46E5)
✓ Headlines: Bold, amarillo (#FCD34D) + blanco alternancia
✓ Subtítulos: Blanco, tamaño reducido
✓ Botones: Amarillo, redondeados (border-radius 24px)
✓ Info boxes: Fondo blanco, sombra suave
✓ Gradientes: Rosa/purple en esquinas (opacity 0.3)
✓ Spacing: Mínimo 2rem padding, gap 1.5rem-2rem
✓ Tipografía: Inter, line-height 1.5-1.6
✓ Responsive: Mobile, tablet, desktop
✓ Logo "custer": Esquina inferior izquierda
```

---

## 🚀 CÓMO USAR

### **Opción 1: Copiar-Pegar Directo**

1. Claude genera el código HTML/CSS
2. Copias el código completo
3. Creas un archivo: `placa-1.html`
4. Lo abres en el navegador
5. ¡Ves la placa diseñada!

### **Opción 2: Múltiples Plaques (Carrusel)**

Si tienes 10 plaques, Claude genera:
```
placa-1.html
placa-2.html
placa-3.html
... etc
```

O un único HTML con **slider/carrusel** que puedas navegar.

---

## 💻 EJEMPLO DE USO EN CLAUDE

```
Diseña estas 3 plaques respetando el Brand Profile de Custer.
Genera código HTML/CSS completo, listo para abrir en navegador.

🟦 Placa 1
TÍTULO: Tu empresa vende. Pero tu marca está desordenada.
SUBTÍTULO: Y eso limita cuánto podés crecer.

🟦 Placa 2
TÍTULO: Señales claras de desorden:
SUBTÍTULO: [lista de puntos]

🟦 Placa 3
[etc...]

Para cada placa:
- Generar HTML/CSS completo
- Respetar colores exactos
- Responsive (mobile-friendly)
- Incluir botón CTA amarillo
- Logo custer en esquina
```

---

## ✨ FEATURES AVANZADOS (OPCIONAL)

Si quieres más interactividad:

### **Carrusel JavaScript**
```javascript
let currentPlaca = 1;
const totalPlacas = 10;

function nextPlaca() {
    currentPlaca = (currentPlaca % totalPlacas) + 1;
    document.querySelector('.carousel').style.transform =
        `translateX(-${(currentPlaca - 1) * 100}%)`;
}

function prevPlaca() {
    currentPlaca = currentPlaca === 1 ? totalPlacas : currentPlaca - 1;
    document.querySelector('.carousel').style.transform =
        `translateX(-${(currentPlaca - 1) * 100}%)`;
}
```

### **Animaciones CSS**
```css
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.content {
    animation: slideIn 0.8s ease-out;
}
```

### **Dark Mode Toggle**
```css
@media (prefers-color-scheme: dark) {
    /* Alternativas para dark mode */
}
```

---

## 📊 VERSIÓN SIMPLIFICADA (SIN CAJAS)

Si quieres un diseño más limpio sin cajas blancas:

```css
/* Solo texto sobre fondo azul */
.headline {
    color: var(--accent-yellow);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
    color: var(--text-white);
    max-width: 80%;
}
```

---

## 🎬 PRÓXIMOS PASOS

1. Claude genera HTML/CSS para cada placa
2. Copias y abres en navegador
3. Ves exactamente cómo se ve
4. Haces ajustes si quieres
5. Pasas al equipo de diseño como referencia
6. O exportas como PDF/PNG para presentar

