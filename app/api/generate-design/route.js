/**
 * POST /api/generate-design
 * Flujo:
 * 1. Claude genera HTML/CSS de la pieza con placeholders para imágenes: <!--IMG:descripción-->
 * 2. gpt-image-1 genera cada imagen en paralelo (base64)
 * 3. Las imágenes se inyectan en el HTML final
 */

import { getCurrentUser } from '@/lib/auth'
import { getADNMarca } from '@/lib/cerebro'

const FORMATOS = {
  'placa-feed':   { w: 1080, h: 1080, label: 'Placa Feed (1:1)' },
  'stories':      { w: 1080, h: 1920, label: 'Stories (9:16)' },
  'banner-email': { w: 600,  h: 200,  label: 'Banner Email' },
  'carrusel':     { w: 1080, h: 1080, label: 'Carrusel (múltiples slides)' },
  'flyer':        { w: 800,  h: 1200, label: 'Flyer vertical' },
}

/**
 * Busca la imagen de un producto en internet usando Claude web search.
 * Devuelve la URL de la imagen o null si no encuentra.
 */
async function buscarImagenProducto(descripcion, apiKey) {
  const query = `${descripcion} PNG producto fondo blanco site:*.com`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Buscá una imagen PNG de "${descripcion}" en internet. Necesito la URL directa de la imagen del producto (preferentemente en fondo blanco o transparente). Devolvé SOLO la URL de la imagen, sin explicaciones. Si no encontrás ninguna URL de imagen válida, devolvé null.`
      }]
    })
  })

  if (!res.ok) return null
  const data = await res.json()
  const texto = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()

  // Extraer URL de imagen de la respuesta
  const urlMatch = texto.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)(?:\?[^\s"'<>]*)?/i)
  return urlMatch ? urlMatch[0] : null
}

/**
 * Descarga una imagen desde una URL y la convierte a base64.
 */
async function urlABase64(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error('No se pudo descargar la imagen')
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/png'
  const b64 = Buffer.from(buffer).toString('base64')
  return `data:${contentType};base64,${b64}`
}

/**
 * Genera imagen con gpt-image-1 como fallback si no se encontró en internet.
 */
async function generarImagenOpenAI(descripcion, openaiKey) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: descripcion,
      n: 1,
      size: '1024x1024',
      output_format: 'base64'
    })
  })
  if (!res.ok) throw new Error('Error OpenAI imagen')
  const data = await res.json()
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenAI no devolvió imagen')
  return `data:image/png;base64,${b64}`
}

/**
 * Obtiene imagen: primero busca en internet, si no encuentra usa gpt-image-1.
 */
async function obtenerImagen(descripcion, apiKey, openaiKey) {
  // 1. Intentar buscar la imagen real del producto en internet
  try {
    const url = await buscarImagenProducto(descripcion, apiKey)
    if (url) {
      const base64 = await urlABase64(url)
      return { base64, fuente: 'web' }
    }
  } catch (e) {
    console.warn('[generate-design] búsqueda web falló:', e.message)
  }

  // 2. Fallback: generar con gpt-image-1
  if (openaiKey) {
    try {
      const base64 = await generarImagenOpenAI(descripcion, openaiKey)
      return { base64, fuente: 'generada' }
    } catch (e) {
      console.warn('[generate-design] gpt-image-1 falló:', e.message)
    }
  }

  return null
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const { brief, formato = 'placa-feed', brain, iteracion = null, imagenAnotada = null } = await request.json()

    if (!brief?.trim()) return Response.json({ error: 'Brief vacío' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })

    const dims = FORMATOS[formato] || FORMATOS['placa-feed']
    const adn = getADNMarca(brain?.nombre)

    const systemPrompt = `Sos un diseñador gráfico senior de nivel mundial, especializado en piezas digitales para redes sociales y marketing.
Tu trabajo: generar HTML/CSS autónomo, 100% self-contained, visualmente impresionante — comparable a piezas de Canva Pro o diseñadores de agencias top.

════════════════════════════════════════
OUTPUT
════════════════════════════════════════
- Respondé ÚNICAMENTE con el HTML completo. Sin explicaciones, sin markdown, sin texto fuera del HTML.
- 100% autónomo: todo el CSS en <style>. Cero links externos, cero @import, cero Google Fonts URLs.
- El root (<html> o primer <div>) debe ser exactamente ${dims.w}px × ${dims.h}px, overflow: hidden.
- Si el brief pide carrusel, usá múltiples slides con display:none excepto el primero, con botones prev/next en JS puro.

════════════════════════════════════════
FUNDACIÓN CSS OBLIGATORIA (siempre incluir)
════════════════════════════════════════
Incluí SIEMPRE este bloque al inicio de <style>:

/* RESET */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
img, video { max-width: 100%; display: block; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

/* DESIGN TOKENS */
:root {
  /* Hue base — derivar todo desde acá */
  --hue: [HUE_DEL_BRIEF];  /* número entre 0-360 */

  /* Paleta OKLCH — perceptualmente uniforme */
  --color-50:  oklch(97% 0.02  var(--hue));
  --color-100: oklch(92% 0.05  var(--hue));
  --color-200: oklch(84% 0.09  var(--hue));
  --color-300: oklch(74% 0.14  var(--hue));
  --color-400: oklch(63% 0.19  var(--hue));
  --color-500: oklch(54% 0.22  var(--hue));  /* primario */
  --color-600: oklch(44% 0.20  var(--hue));
  --color-700: oklch(35% 0.16  var(--hue));
  --color-800: oklch(26% 0.12  var(--hue));
  --color-900: oklch(17% 0.08  var(--hue));
  --color-950: oklch(11% 0.05  var(--hue));
  --complement: oklch(57% 0.18 calc(var(--hue) + 180));

  /* Semánticos */
  --bg:         var(--color-50);
  --surface:    var(--color-100);
  --border:     var(--color-200);
  --text:       var(--color-900);
  --text-muted: var(--color-600);
  --accent:     var(--color-500);

  /* Espaciado (base 4px) */
  --sp-1: 0.25rem; --sp-2: 0.5rem; --sp-3: 0.75rem; --sp-4: 1rem;
  --sp-5: 1.5rem;  --sp-6: 2rem;   --sp-7: 3rem;    --sp-8: 4rem;
  --sp-9: 6rem;    --sp-10: 8rem;

  /* Radios */
  --r-sm: 0.25rem; --r-md: 0.5rem; --r-lg: 0.75rem; --r-xl: 1rem;
  --r-2xl: 1.5rem; --r-3xl: 2rem;  --r-pill: 9999px;

  /* Sombras realistas (hue-matched, en capas) */
  --shadow-clr: var(--hue) 40% 25%;
  --shadow-1: 0.5px 1px 1px hsl(var(--shadow-clr) / 0.6);
  --shadow-2: 1px 2px 2px hsl(var(--shadow-clr)/0.28), 2px 4px 4px hsl(var(--shadow-clr)/0.22), 3px 6px 6px hsl(var(--shadow-clr)/0.16);
  --shadow-3: 2px 4px 4px hsl(var(--shadow-clr)/0.18), 4px 8px 8px hsl(var(--shadow-clr)/0.18), 8px 16px 16px hsl(var(--shadow-clr)/0.18), 16px 32px 32px hsl(var(--shadow-clr)/0.12);

  /* Tipografía fluida */
  --fs-xs:  clamp(0.7rem,   0.68rem + 0.12vw, 0.82rem);
  --fs-sm:  clamp(0.85rem,  0.82rem + 0.15vw, 1rem);
  --fs-md:  clamp(1rem,     0.96rem + 0.22vw, 1.2rem);
  --fs-lg:  clamp(1.25rem,  1.18rem + 0.38vw, 1.5rem);
  --fs-xl:  clamp(1.5rem,   1.38rem + 0.62vw, 2rem);
  --fs-2xl: clamp(2rem,     1.78rem + 1.1vw,  2.8rem);
  --fs-3xl: clamp(2.5rem,   2.1rem  + 2vw,    3.8rem);
  --fs-4xl: clamp(3rem,     2.4rem  + 3vw,    5rem);

  /* Easings premium */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Durations */
  --dur-fast: 140ms; --dur-base: 280ms; --dur-slow: 500ms;
}

/* TIPOGRAFÍA — System font stacks (cero dependencia externa) */
:root {
  --font-sans:   Inter, Roboto, 'Helvetica Neue', 'Arial Nova', Arial, sans-serif;
  --font-geo:    Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif;
  --font-serif:  Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif;
  --font-display: 'Gill Sans Nova', Optima, Candara, Gill Sans, source-sans-pro, sans-serif;
}

/* ANIMACIONES — keyframes base */
@keyframes fadeUp    { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
@keyframes scaleIn   { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
@keyframes slideLeft { from { opacity:0; transform:translateX(-28px) } to { opacity:1; transform:translateX(0) } }
@keyframes blurIn    { from { opacity:0; filter:blur(16px) } to { opacity:1; filter:blur(0) } }
@keyframes float     { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-14px) } }
@keyframes shimmer   { from { background-position: -200% center } to { background-position:200% center } }
@keyframes spin      { to { transform:rotate(360deg) } }
@keyframes pulse     { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
@keyframes gradFlow  { 0%,100% { background-position:0% 50% } 50% { background-position:100% 50% } }

/* STAGGER — aplicar .stagger a cualquier lista */
.stagger > * { animation: fadeUp var(--dur-slow) var(--ease-spring) both; }
.stagger > *:nth-child(1) { animation-delay:0ms }
.stagger > *:nth-child(2) { animation-delay:80ms }
.stagger > *:nth-child(3) { animation-delay:160ms }
.stagger > *:nth-child(4) { animation-delay:240ms }
.stagger > *:nth-child(5) { animation-delay:320ms }
.stagger > *:nth-child(6) { animation-delay:400ms }

/* ACCESIBILIDAD */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

════════════════════════════════════════
REGLAS DE DISEÑO DE ALTA CALIDAD
════════════════════════════════════════

TIPOGRAFÍA:
- Headings principales: font-size var(--fs-3xl) o var(--fs-4xl), letter-spacing: -0.03em, line-height: 1.05, font-weight: 800, text-wrap: balance
- Subheadings: letter-spacing: -0.02em, line-height: 1.2
- Etiquetas/tags/eyebrows: MAYÚSCULAS, letter-spacing: 0.1em, font-size var(--fs-xs), font-weight: 700
- Body: max-width: 55ch, line-height: 1.65, text-wrap: pretty
- Nunca mezclar más de 2 familias tipográficas

COLORES:
- Definir --hue según el brand/brief (verde ≈ 145, azul ≈ 220, violeta ≈ 280, naranja ≈ 30, rojo ≈ 10)
- Si hay ADN de marca con colores exactos, extraé el hue de esos colores y usá OKLCH
- Máximo 2 colores de acento + escala de neutrales derivada del hue
- Fondos oscuros: oklch(10%-15% 0.04-0.06 var(--hue))
- Fondos claros: oklch(96%-99% 0.01-0.02 var(--hue))

EFECTOS PREMIUM (elegir según el estilo del brief):
1. TEXTO GRADIENTE (impacto en headlines):
   background: linear-gradient(135deg, oklch(65% 0.25 var(--hue)), oklch(60% 0.22 calc(var(--hue)+50)));
   -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;

2. GLASSMORPHISM (para cards sobre fondos con imagen/gradiente):
   background: rgba(255,255,255,0.1); backdrop-filter: blur(20px) saturate(180%);
   border: 1px solid rgba(255,255,255,0.25); border-radius: var(--r-2xl);
   box-shadow: 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4);

3. MESH GRADIENT (fondos muy premium):
   background-color: oklch(12% 0.05 var(--hue));
   background-image: radial-gradient(at 35% 25%, oklch(65% 0.22 var(--hue) / 0.5) 0px, transparent 55%),
                     radial-gradient(at 80% 15%, oklch(60% 0.20 calc(var(--hue)+50) / 0.4) 0px, transparent 50%),
                     radial-gradient(at 15% 80%, oklch(55% 0.18 calc(var(--hue)-30) / 0.4) 0px, transparent 55%);

4. NEON GLOW (fondos oscuros):
   color: oklch(85% 0.28 var(--hue));
   text-shadow: 0 0 7px oklch(85% 0.28 var(--hue)), 0 0 20px oklch(75% 0.22 var(--hue)/0.7), 0 0 45px oklch(65% 0.18 var(--hue)/0.4);

5. GRADIENTE ANIMADO (fondos dinámicos):
   background: linear-gradient(135deg, oklch(54% 0.22 var(--hue)), oklch(54% 0.22 calc(var(--hue)+60)), oklch(54% 0.22 calc(var(--hue)+120)));
   background-size: 300% 300%; animation: gradFlow 8s ease infinite;

SOMBRAS:
- Usar siempre var(--shadow-2) o var(--shadow-3) en cards, nunca sombra plana gris
- Dirección de luz: siempre desde arriba-izquierda (consistent)

ESPACIADO:
- Múltiplos de 4px. Usar var(--sp-*). Padding de contenedor ≥ var(--sp-6)
- Ritmo vertical: consistente, suficiente aire blanco

ÍCONOS (SVG inline, NUNCA emoji para diseños):
- Usar paths de Lucide o Heroicons embebidos inline
- stroke="currentColor", fill="none", stroke-width="1.5" o "2"
- width/height: 20px a 48px según contexto
- Siempre usar currentColor para heredar el color del texto

ANIMACIONES:
- Aplicar clase .stagger a listas de pasos, features, cards
- Entrances: animation: fadeUp var(--dur-slow) var(--ease-spring) both
- Elementos decorativos flotantes: animation: float 4s ease-in-out infinite
- NO animar layout properties (width, height, top, left) — solo transform y opacity

════════════════════════════════════════
PATRONES DE LAYOUT
════════════════════════════════════════
- Post social (cuadrado/story): grid con área de fondo + contenido superpuesto
- Flyer: sección hero + cuerpo + footer CTA
- Banner: flex horizontal con logo | copy | CTA
- Carrusel: slides absolutos, fade transition
- Siempre definir aspect-ratio en el contenedor raíz

${openaiKey ? `
════════════════════════════════════════
IMÁGENES
════════════════════════════════════════
- Para imágenes reales (foto producto, persona, ambiente fotográfico, background con textura real): usá este placeholder EXACTO en el src del img:
  <img src="<!--IMG:descripción detallada en español-->" style="..." />
- Máximo 2 imágenes por pieza. Solo cuando aporten valor real.
- Para todo lo demás: SVG inline, CSS gradients, shapes geométricas.` : `
- No uses imágenes externas. Todo con SVG inline, CSS shapes, y gradientes.`}

${adn ? `
════════════════════════════════════════
ADN DE MARCA
════════════════════════════════════════
${adn}

⚠️ IMPORTANTE: Respetá FIELMENTE la paleta de colores, tipografía y estilo visual de esta marca. Derivá el --hue de los colores primarios del ADN.` : `
Usá una paleta profesional y moderna acorde al brief. Elegí un --hue que refuerce el mensaje.`}`

    // Construir mensaje — con imagen anotada si viene
    let userMessage
    if (iteracion) {
      const texto = `Tenés este HTML previo:\n\n${iteracion}\n\nAplicá este cambio: ${brief}\n\nDevolvé el HTML completo actualizado.`
      if (imagenAnotada) {
        userMessage = [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imagenAnotada.replace(/^data:image\/\w+;base64,/, '') } },
          { type: 'text', text: `Esta imagen muestra la pieza con zonas marcadas indicando qué cambiar.\n\n${texto}` }
        ]
      } else {
        userMessage = texto
      }
    } else {
      userMessage = `Generá una pieza "${dims.label}" (${dims.w}×${dims.h}px):\n\n${brief}\n\nDevolvé solo el HTML.`
    }

    // 1. Claude genera el HTML con placeholders
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const claudeData = await claudeRes.json()
    let html = claudeData.content[0]?.text || ''
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    if (!html.includes('<')) throw new Error('Claude no devolvió HTML válido')

    // 2. Extraer placeholders y resolver imágenes (web search primero, gpt-image-1 como fallback)
    const placeholders = [...html.matchAll(/<!--IMG:([^>]+)-->/g)]

    if (placeholders.length > 0) {
      const imagenes = await Promise.allSettled(
        placeholders.map(([, desc]) => obtenerImagen(desc.trim(), apiKey, openaiKey))
      )

      const resumen = []
      placeholders.forEach(([match], i) => {
        const resultado = imagenes[i]
        if (resultado.status === 'fulfilled' && resultado.value) {
          html = html.replace(`src="${match}"`, `src="${resultado.value.base64}"`)
          html = html.replace(match, resultado.value.base64)
          resumen.push({ desc: placeholders[i][1], fuente: resultado.value.fuente })
        } else {
          // Fallback: placeholder SVG gris
          const svgFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='16' font-family='sans-serif'%3EImagen%3C/text%3E%3C/svg%3E`
          html = html.replace(`src="${match}"`, `src="${svgFallback}"`)
          html = html.replace(match, svgFallback)
          resumen.push({ desc: placeholders[i][1], fuente: 'fallback' })
        }
      })

      return Response.json({ success: true, html, formato, dims, imagenes: resumen })
    }

    return Response.json({ success: true, html, formato, dims, imagenes_generadas: 0 })

  } catch (error) {
    console.error('Error en /api/generate-design:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
