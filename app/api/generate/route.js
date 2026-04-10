/**
 * POST /api/generate
 * Generador de piezas de diseño con Claude como diseñador gráfico
 *
 * Claude no genera solo texto — genera HTML/CSS completo
 * con conocimiento real de teoría de diseño.
 */

import { getCurrentUser } from '@/lib/auth'

// ─────────────────────────────────────────────
// DESIGN SYSTEM PROMPT — Teoría de diseño real
// ─────────────────────────────────────────────
const DESIGN_SYSTEM_PROMPT = `
Eres un diseñador gráfico senior especialista en diseño editorial y comunicación de marca.
Tenés conocimiento profundo de:

## GRIDS Y RETÍCULAS CONSTRUCTIVAS
- Grid de 12 columnas con gutters de 24px — base para toda composición
- Baseline grid de 8px — todos los espaciados son múltiplos de 8 (8, 16, 24, 32, 48, 64)
- Grid modular: combinación de filas y columnas para crear módulos visuales
- Retícula manuscrita: columna única con márgenes amplios, para contenido largo
- Retícula columnar: 2–4 columnas para revistas y carruseles
- Safe zones: 5% de margen en todos los lados para piezas de redes sociales

## CAMINO DEL LECTOR
- Z-Pattern: para piezas de impacto (ads, portadas) — el ojo va de arriba izquierda → arriba derecha → abajo izquierda → abajo derecha
- F-Pattern: para contenido informativo — dos barras horizontales en la parte superior, luego lectura vertical
- Diagonal de Gutenberg: para piezas más simples — arriba izquierda (punto de entrada) → abajo derecha (punto terminal)
- Colocá los elementos más importantes en el camino natural del ojo

## JERARQUÍA TIPOGRÁFICA
- Escala modular 1.25 (Major Third): base 16px → 20 → 25 → 31 → 39 → 49px
- Máximo 3 niveles de jerarquía por pieza (headline, subhead, body)
- Contraste de peso: headline en 800–900, body en 400
- Tracking (letter-spacing): uppercase lleva +0.1em, headlines grandes llevan -0.02em
- Line-height: headlines 1.1–1.2, body 1.5–1.6
- La tipografía es el 70% del diseño — usala como elemento visual, no solo funcional

## PSICOLOGÍA DEL COLOR
- Temperatura: colores cálidos (rojo, naranja, amarillo) = urgencia, energía, acción
- Temperatura: colores fríos (azul, verde, violeta) = confianza, calma, tecnología
- Contraste simultáneo: un color se ve diferente según el fondo — ajustá saturación
- Regla 60-30-10: 60% color dominante, 30% secundario, 10% acento
- Contraste mínimo de accesibilidad: 4.5:1 para texto normal, 3:1 para texto grande
- Fondos oscuros: texto en blanco o muy claro (nunca gris medio)
- Fondos claros: texto muy oscuro (nunca negro puro, usá #1A1A2E o similar)

## PRINCIPIOS GESTALT
- Proximidad: elementos cercanos = relacionados. Separación crea grupos visuales
- Similitud: mismo color/forma = mismo grupo o importancia
- Cierre: el cerebro completa formas incompletas — usá marcos parciales, underlines creativos
- Continuidad: líneas y curvas guían el ojo — creá flujo visual con elementos alineados
- Figura-fondo: asegurate que el sujeto principal sea claramente distinguible del fondo

## PROPORCIÓN Y COMPOSICIÓN
- Regla de tercios: dividí el espacio en 3×3 — los puntos de intersección son los más fuertes visualmente
- Proporción áurea (1.618): usala en proporciones de bloques y espaciados
- Espacio negativo: el espacio vacío es un elemento de diseño, no un error — da respiración y enfoque
- Peso visual: elementos grandes/oscuros/saturados pesan más — balanceá la composición
- Tensión dinámica: elementos fuera de centro crean dinamismo; elementos centrados dan calma y autoridad

## FORMATOS DE REDES SOCIALES
- Instagram Post: 1080×1080px (1:1) — en CSS: width 500px, aspect-ratio 1/1
- Instagram Story/Reels: 1080×1920px (9:16) — en CSS: width 280px, aspect-ratio 9/16
- Carrusel slide: 1080×1080px — igual que post pero en secuencia narrativa
- LinkedIn Post: 1200×628px (1.91:1) — en CSS: width 500px, aspect-ratio 1.91/1
- La primera slide de un carrusel es el gancho — debe parar el scroll en 0.3 segundos

## SISTEMA DE DISEÑO EN CÓDIGO
- Usá CSS Grid y Flexbox — nunca posicionamiento absoluto innecesario
- Variables CSS para colores de marca: --color-brand, --color-accent, --color-bg
- Sombras: box-shadow con alpha bajo (0.1–0.2) para elevación sutil
- Border-radius: consistente dentro de la pieza (si usás 12px, usalo en todo)
- Transiciones suaves si aplica: 0.2–0.3s ease
- Font stack: font de marca como primera opción, luego fallback system-ui
`

// ─────────────────────────────────────────────
// Construir contexto de marca desde el Brain
// ─────────────────────────────────────────────
function buildBrandContext(brain) {
  if (!brain?.nombre) return 'No hay marca definida aún.'

  const b = brain
  const lines = []

  lines.push(`## MARCA: ${b.nombre}`)
  if (b.rubro) lines.push(`Rubro: ${b.rubro}`)
  if (b.ciudad) lines.push(`Ciudad: ${b.ciudad}`)
  if (b.propuesta) lines.push(`Propuesta de valor: ${b.propuesta}`)
  if (b.publico) lines.push(`Público objetivo: ${b.publico}`)
  if (b.mision) lines.push(`Misión: ${b.mision}`)
  if (b.claim) lines.push(`Claim/Tagline: "${b.claim}"`)

  lines.push(`\n## SISTEMA DE COLOR`)
  lines.push(`Color primario: ${b.color_primario || '#6860EE'}`)
  lines.push(`Color secundario: ${b.color_secundario || '#F5A623'}`)
  if (b.acentos) lines.push(`Colores acento: ${b.acentos}`)
  if (b.estilo_visual) lines.push(`Estilo visual: ${b.estilo_visual}`)
  if (b.moodBoard) lines.push(`Mood board / Referentes: ${b.moodBoard}`)

  lines.push(`\n## TIPOGRAFÍA`)
  lines.push(`Fuente principal: ${b.tipografia_principal || b.tipoPrincipal || 'Montserrat'}`)
  if (b.tipografia_secundaria || b.tipoSecundaria) {
    lines.push(`Fuente secundaria: ${b.tipografia_secundaria || b.tipoSecundaria}`)
  }

  lines.push(`\n## VOZ Y COMUNICACIÓN`)
  if (b.registro) lines.push(`Registro: ${b.registro}`)
  if (b.vozTono) lines.push(`Voz y tono: ${b.vozTono}`)
  if (b.tonalidad2 || b.tonalidad) lines.push(`Tonalidad: ${b.tonalidad2 || b.tonalidad}`)
  if (b.keywords) lines.push(`Keywords de marca: ${b.keywords}`)
  if (b.avoid) lines.push(`Palabras a evitar: ${b.avoid}`)
  if (b.ejemplos) lines.push(`Ejemplos de comunicación: ${b.ejemplos}`)

  if (b.valores) lines.push(`\nValores: ${b.valores}`)
  if (b.diferenciadores) lines.push(`Diferenciadores: ${b.diferenciadores}`)
  if (b.territorioCreativo) lines.push(`Territorio creativo: ${b.territorioCreativo}`)

  if (b.painPoints) lines.push(`\nPain points del público: ${b.painPoints}`)
  if (b.gains) lines.push(`Gains del público: ${b.gains}`)

  return lines.join('\n')
}

// ─────────────────────────────────────────────
// Prompt del usuario con instrucción de diseño
// ─────────────────────────────────────────────
function buildUserPrompt({ topic, format, qty, brand, imageUrl, conversationHistory }) {
  const colorPrimary = brand?.color_primario || '#6860EE'
  const colorSecondary = brand?.color_secundario || '#F5A623'
  const fontMain = brand?.tipografia_principal || brand?.tipoPrincipal || 'Montserrat'
  const brandName = brand?.nombre || 'Marca'

  const formatSpecs = {
    carrusel:  { css: 'width:500px; aspect-ratio:1/1;',  label: 'Carrusel Instagram (1:1)',   slides: qty },
    stories:   { css: 'width:280px; aspect-ratio:9/16;', label: 'Instagram Story (9:16)',     slides: qty },
    post:      { css: 'width:500px; aspect-ratio:1/1;',  label: 'Post único Instagram (1:1)', slides: 1   },
    reels:     { css: 'width:280px; aspect-ratio:9/16;', label: 'Reel/Story (9:16)',          slides: qty },
    linkedin:  { css: 'width:500px; aspect-ratio:1.91/1;', label: 'LinkedIn Post',            slides: 1   },
  }

  const spec = formatSpecs[format] || formatSpecs.carrusel
  const totalSlides = spec.slides

  const imageNote = imageUrl
    ? `\nIMAGEN GENERADA DISPONIBLE: ${imageUrl}\nPodés usarla como background o elemento visual con un overlay para mantener legibilidad.`
    : '\nNo hay imagen generada. Usá fondos con gradientes, formas geométricas CSS y tipografía como elemento visual principal.'

  const historyNote = conversationHistory?.length
    ? `\n\nCONTEXTO DE CONVERSACIONES PREVIAS:\n${conversationHistory}`
    : ''

  return `
Diseñá ${totalSlides} slide(s) para ${spec.label}.

TEMA: "${topic}"
MARCA: ${brandName}

RESTRICCIONES TÉCNICAS:
- Cada slide: <div style="${spec.css} font-family:'${fontMain}',Montserrat,system-ui; overflow:hidden; position:relative;">...</div>
- Color primario (fondos, bloques principales): ${colorPrimary}
- Color secundario (CTAs, acentos, highlights): ${colorSecondary}
- Solo inline styles — no clases CSS externas
- Imágenes: solo URLs absolutas o data URIs
- No usar <script>, <link>, <style>, ni etiquetas de bloque HTML fuera del div principal
${imageNote}
${historyNote}

INSTRUCCIONES DE DISEÑO:
1. Aplicá los principios del Design System: grid, jerarquía, camino del lector
2. ${format === 'carrusel' ? 'Slide 1 = gancho visual que para el scroll. Slides 2-N = desarrollo narrativo. Última slide = CTA.' : 'Diseñá para máximo impacto visual en 0.3 segundos.'}
3. Cada slide debe ser visualmente independiente pero cohesiva en la serie
4. Usá la psicología del color: el color primario de la marca y su temperatura deben guiar el estado emocional
5. Jerarquía clara: 1 mensaje principal por slide, nunca compitas con 2 titulares
6. Espacio negativo generoso — mejor menos elementos, más impacto
7. El texto debe ser legible siempre — contrastes correctos

Respondé ÚNICAMENTE con JSON válido, sin markdown ni texto extra:
{
  "slides": [
    {
      "index": 0,
      "label": "nombre descriptivo del slide",
      "design_rationale": "1 oración explicando las decisiones de diseño",
      "html": "<div style=\\"${spec.css}...\\">...HTML completo del slide...</div>"
    }
  ]
}
`
}

// ─────────────────────────────────────────────
// Generar imagen con Replicate (Flux)
// ─────────────────────────────────────────────
async function generateImage(topic, brand) {
  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) return null

  const colorPrimary = brand?.color_primario || '#6860EE'
  const style = brand?.estilo_visual || 'moderno'
  const brandName = brand?.nombre || ''

  // Prompt de imagen consciente de la marca
  const imgPrompt = [
    `${topic}`,
    `professional ${style} style photography`,
    `brand colors: ${colorPrimary}`,
    brandName ? `for ${brandName} brand` : '',
    'clean composition, rule of thirds',
    'high quality, 4k, commercial photography',
    'no text, no logos'
  ].filter(Boolean).join(', ')

  try {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-schnell',
        input: { prompt: imgPrompt, width: 1024, height: 1024, num_outputs: 1 }
      })
    })

    if (!res.ok) return null
    const prediction = await res.json()
    if (!prediction.id) return null

    // Polling hasta completar (max 30s)
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 500))
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      })
      const data = await poll.json()
      if (data.status === 'succeeded') return data.output?.[0] || null
      if (data.status === 'failed') return null
    }
  } catch {
    return null
  }
  return null
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { topic, format = 'carrusel', brain: brandData, quantity, conversationHistory } = await request.json()

    if (!topic) {
      return Response.json({ error: 'El tema es requerido' }, { status: 400 })
    }

    const brain = brandData || {}
    const qty = Math.min(Math.max(parseInt(quantity) || 5, 1), 10)
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
    }

    // Generar imagen en paralelo mientras preparamos el prompt
    console.log(`🎨 Generando diseño: "${topic}" | Formato: ${format} | Slides: ${qty}`)
    const imageUrl = await generateImage(topic, brain)
    if (imageUrl) console.log('✅ Imagen generada con Replicate')

    const system = DESIGN_SYSTEM_PROMPT + '\n\n' + buildBrandContext(brain)
    const userPrompt = buildUserPrompt({ topic, format, qty, brand: brain, imageUrl, conversationHistory })

    // Claude genera los slides completos
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.json()
      throw new Error(err.error?.message || 'Error en Claude API')
    }

    const claudeData = await claudeRes.json()
    const responseText = claudeData.content[0]?.text || ''

    // Parsear JSON de la respuesta
    let parsed = null
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch (e) {
      console.error('Error parsing Claude response:', e)
      throw new Error('Claude no devolvió JSON válido')
    }

    if (!parsed?.slides?.length) {
      throw new Error('No se generaron slides. Respuesta: ' + responseText.slice(0, 300))
    }

    console.log(`✅ ${parsed.slides.length} slides generados por Claude`)

    // Formatear respuesta compatible con el frontend existente
    return Response.json({
      success: true,
      topic,
      format,
      imageUrl,
      slides: parsed.slides,
      // Compatibilidad con código anterior del frontend
      ads: parsed.slides.map((s, i) => ({
        type: format,
        headline: s.label || `Slide ${i + 1}`,
        body: s.design_rationale || '',
        html: s.html,
        index: s.index ?? i,
        imageUrl: imageUrl || null
      }))
    })

  } catch (error) {
    console.error('❌ Error en generate:', error)
    return Response.json(
      { error: error.message || 'Error generando contenido' },
      { status: 500 }
    )
  }
}
