/**
 * POST /api/auto-populate-brand
 * Análisis completo de marca — UN solo call a Claude que analiza todo
 *
 * Acepta: {
 *   files: [{name, type, data: "base64string"}],  ← ya sin prefijo data:...;base64,
 *   visualImages: [{name, type, data: "base64string"}],  ← imágenes del feed
 *   websiteUrl: "https://...",
 *   instagramHandle: "@usuario",
 *   brandText: "texto libre"
 * }
 */

import { getCurrentUser } from '@/lib/auth'
import { saveBrand } from '@/lib/brands-db'
import { readFileSync } from 'fs'
import { join } from 'path'

function getApiKey() {
  let key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    try { const e = readFileSync(join(process.cwd(), '.env.local'), 'utf8'); const m = e.match(/ANTHROPIC_API_KEY=(.+)/); if (m) key = m[1].trim() } catch {}
    try { const e = readFileSync(join(process.cwd(), '.env'), 'utf8'); const m = e.match(/ANTHROPIC_API_KEY=(.+)/); if (m) key = m[1].trim() } catch {}
  }
  return key
}

const SYSTEM_PROMPT = `Sos un equipo creativo senior de una agencia de marketing completa. Tenés la experiencia acumulada de:
- Directora de Arte con 15 años en branding y diseño gráfico
- Estratega de contenido y social media manager
- Media Buyer experto en Meta Ads y Google Ads
- Community Manager con foco en engagement y crecimiento
- Director Creativo de producción audiovisual
- Planificador estratégico de campañas 360°

Analizás TODO el material de la marca y construís un Brand Brain exhaustivo y accionable, en español, en lenguaje claro para todos los departamentos de la agencia.

Respondé SOLO JSON válido sin markdown ni explicaciones. Completá TODOS los campos posibles — si podés inferirlo, inferílo.`

function buildPrompt(sources) {
  return `Analizá toda esta información y construí el Brand Brain completo para la agencia.

${sources}

Devolvé este JSON (completá TODOS los campos posibles, sin dejar null si hay forma de inferirlo):

{
  "basico": {
    "nombre": "nombre comercial",
    "rubro": "sector específico (ej: Agencia de Marketing Digital, Indumentaria Streetwear)",
    "ciudad": "ciudad y país",
    "propuesta": "propuesta de valor en una oración poderosa"
  },
  "estrategico": {
    "mision": "misión real de la marca",
    "vision": "visión a futuro",
    "valores": ["valor 1", "valor 2", "valor 3", "valor 4"],
    "beneficios_funcionales": "qué problema concreto resuelve",
    "beneficios_emocionales": "cómo hace sentir a quien lo usa o contrata"
  },
  "audiencia": {
    "publico_objetivo": "perfil demográfico: edad, género, nivel socioeconómico, ubicación",
    "audiencia_real": "quién compra realmente hoy vs quién debería comprar",
    "pain_points": ["problema 1 que sufre", "problema 2", "problema 3"],
    "gains": ["beneficio 1 que busca", "beneficio 2", "beneficio 3"],
    "motivaciones": "qué los impulsa a actuar: miedo, aspiración, identidad, conveniencia",
    "comportamiento_digital": "qué redes usa, cómo consume contenido, horarios, qué sigue"
  },
  "identidad": {
    "voz_tono": "cómo habla la marca: 3-5 adjetivos (ej: directo, cálido, experto, con humor)",
    "claim": "tagline o claim de la marca",
    "narrativa": "historia de la marca, de dónde viene, por qué existe",
    "territorio_creativo": "universo conceptual y emocional donde vive la marca"
  },
  "visual": {
    "tipografia": "tipografía principal detectada o recomendada",
    "colores": {
      "primario": "#RRGGBB",
      "secundario": "#RRGGBB",
      "acentos": ["#RRGGBB", "#RRGGBB"]
    },
    "estilo_visual": "descriptor del estilo (minimalista bold, oscuro premium, colorido dinámico...)",
    "recursos_graficos": "iconos de línea, ilustraciones, formas geométricas, gradientes, texturas",
    "sistema_grafico": "cómo se construyen las piezas: grillas, proporciones, espacio negativo",
    "mood_board": "palabras que describen el mood visual"
  },
  "posicionamiento": {
    "competencia": ["competidor directo 1", "competidor 2", "competidor indirecto"],
    "diferenciadores": ["qué los hace únicos 1", "diferenciador 2", "diferenciador 3"],
    "propuesta_unica": "UVP — la única razón para elegir esta marca sobre todas las demás"
  },
  "implementacion": {
    "canales": ["Instagram", "LinkedIn", "TikTok", "Email", "YouTube"],
    "formatos": ["Reels", "Carrusel", "Stories", "Static Post", "Newsletter"],
    "frecuencia": "frecuencia de publicación recomendada por canal"
  },
  "comunicacion": {
    "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
    "avoid": ["a evitar 1", "a evitar 2", "a evitar 3"],
    "tonalidad": ["característica tonal 1", "característica 2", "característica 3"],
    "ejemplos": "ejemplo de copy que refleje perfectamente la voz de la marca"
  },
  "departamentos": {
    "diseno_grafico": {
      "paleta_completa": "uso de cada color: primario para fondos, secundario para tipografía, acento para CTAs",
      "tipografia_guia": "guía de uso: cuándo usar cada peso y tamaño, combinaciones",
      "estilo_fotografia": "cómo deben ser las fotos: iluminación, composición, temática, qué NO usar",
      "iconografia": "estilo de íconos: grosor, relleno o outline, cuándo usarlos",
      "dos_and_donts": ["✅ Sí: uso correcto 1", "✅ Sí: uso correcto 2", "❌ No: error común 1", "❌ No: error común 2", "❌ No: error común 3"],
      "referencias_visuales": "marcas o estilos de referencia para inspiración"
    },
    "social_media": {
      "pilares_contenido": ["Pilar 1: nombre y descripción clara", "Pilar 2", "Pilar 3", "Pilar 4"],
      "calendario_sugerido": "estructura de la semana: lunes educacional, miércoles entretenimiento, viernes CTA, etc.",
      "formatos_por_plataforma": "Instagram: Reels + carrusel | LinkedIn: artículos | TikTok: tendencias",
      "copy_style": "cómo escribir captions: extensión, emojis, CTAs, hashtags",
      "tendencias_aplicables": "tendencias actuales que la marca puede aprovechar ahora",
      "metricas_clave": "qué medir: engagement rate, alcance, saves, DMs, clics en bio"
    },
    "paid_media": {
      "audiencias_facebook": "intereses, comportamientos y demografía para Meta Ads",
      "audiencias_google": "keywords de búsqueda, intención comercial, match types recomendados",
      "mensajes_por_objetivo": {
        "awareness": "mensaje para quienes no conocen la marca",
        "consideracion": "mensaje para quienes la conocen pero no compraron",
        "conversion": "mensaje para llevarlos a la acción de compra"
      },
      "formatos_ads": "qué formatos funcionan mejor para esta marca y por qué",
      "presupuesto_sugerido": "distribución sugerida: % branding vs % conversión vs % retargeting",
      "copy_ads": "ejemplo de headline + descripción para un anuncio de conversión"
    },
    "content": {
      "topicos_principales": ["tema evergreen 1", "tema de tendencia", "tema educacional", "caso de éxito"],
      "seo_keywords": ["keyword principal", "keyword secundaria", "keyword long tail"],
      "estructura_contenido": "cómo estructurar posts/artículos: hook, desarrollo, CTA",
      "voz_escrita": "¿tuteás o ustedeás? ¿emojis? ¿humor? ¿datos? ¿storytelling?",
      "contenido_viral": "qué tipo de contenido tiene mayor potencial viral para esta marca"
    },
    "video": {
      "estilo_visual": "ritmo de edición, tipo de cortes, transiciones, motion graphics",
      "musica_mood": "tipo de música: energética, ambient, trap, folklore, sin música",
      "duracion_formato": "Reels: 7-15s | TikTok: 15-30s | YouTube: 3-8 min",
      "hook_visual": "cómo capturar atención en los primeros 3 segundos",
      "texto_en_pantalla": "subtítulos, captions, overlays: cuándo y cómo",
      "referencias_videos": "creadores o marcas cuyo estilo de video es referencia"
    },
    "community_management": {
      "tono_respuestas": "cómo responder comentarios: formal/informal, con emojis, con humor",
      "protocolo_crisis": "cómo manejar comentarios negativos o crisis de reputación paso a paso",
      "frases_aprobadas": ["frase de bienvenida o saludo", "respuesta a reclamos", "respuesta a consultas de precio"],
      "palabras_clave_monitorear": ["keyword a monitorear 1", "keyword 2", "hashtag propio"],
      "engagement_proactivo": "estrategia para generar interacción: preguntas, encuestas, challenges",
      "horarios_optimos": "mejores horarios para publicar y para responder según la audiencia"
    }
  }
}`
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return Response.json({ error: 'API Key no configurada' }, { status: 500 })
    }

    const body = await request.json()
    const {
      files = [],          // [{name, type, data: base64}] — archivos principales
      visualImages = [],   // [{name, type, data: base64}] — imágenes del feed para análisis visual
      websiteUrl = '',
      instagramHandle = '',
      brandText = ''
    } = body

    const allImages = [...files, ...visualImages].filter(f => f.type?.startsWith('image/') && f.data)
    const pdfs = files.filter(f => (f.type === 'application/pdf' || f.name?.endsWith('.pdf')) && f.data)

    const hasInput = files.length > 0 || visualImages.length > 0 || instagramHandle || websiteUrl || brandText
    if (!hasInput) {
      return Response.json({ error: 'Cargá al menos una fuente de información' }, { status: 400 })
    }

    console.log(`🚀 Analizando marca: ${allImages.length} imágenes, ${pdfs.length} PDFs, URL: ${!!websiteUrl}`)

    // Construir fuentes de texto
    const textSources = []

    if (brandText?.trim()) {
      textSources.push(`## INFORMACIÓN DE LA MARCA (proporcionada por el cliente)\n${brandText}`)
    }

    if (instagramHandle?.trim()) {
      const handle = instagramHandle.replace('@', '').trim()
      textSources.push(`## INSTAGRAM\nHandle: @${handle}`)
    }

    // Scrape del sitio web
    if (websiteUrl?.trim()) {
      try {
        let url = websiteUrl.trim()
        if (!url.startsWith('http')) url = 'https://' + url
        const ctrl = new AbortController()
        const t = setTimeout(() => ctrl.abort(), 12000)
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
          signal: ctrl.signal
        })
        clearTimeout(t)
        const html = await res.text()
        textSources.push(`## SITIO WEB: ${url}\n${extractWebContent(html)}`)
      } catch (e) {
        console.warn('Scrape falló:', e.message)
        textSources.push(`## SITIO WEB\nURL: ${websiteUrl} (no accesible)`)
      }
    }

    // Construir el mensaje para Claude
    const messageContent = []

    // PDFs (con anthropic-beta header)
    const hasPdfs = pdfs.length > 0
    for (const pdf of pdfs.slice(0, 3)) {
      messageContent.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: pdf.data }
      })
    }

    // Imágenes
    for (const img of allImages.slice(0, 12)) {
      // Limpiar el base64 — asegurarse que no tiene prefijo
      let data = img.data || ''
      if (data.includes(',')) data = data.split(',')[1]
      if (!data) continue

      const mediaType = img.type?.startsWith('image/') ? img.type : 'image/jpeg'
      messageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data }
      })
    }

    // Texto con todas las fuentes
    const sourcesText = textSources.length > 0 ? textSources.join('\n\n---\n\n') : 'Analizá los archivos adjuntos.'
    messageContent.push({ type: 'text', text: buildPrompt(sourcesText) })

    // Headers para la API
    const headers = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    }
    if (hasPdfs) {
      headers['anthropic-beta'] = 'pdfs-2024-09-25'
    }

    console.log(`📊 Enviando a Claude: ${messageContent.length} bloques (${allImages.length} imgs, ${pdfs.length} PDFs)`)

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: messageContent }]
      })
    })

    if (!claudeResponse.ok) {
      const err = await claudeResponse.json()
      throw new Error(err.error?.message || `Error API: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json()
    let responseText = claudeData.content?.[0]?.text?.trim() || ''

    // Limpiar markdown
    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    let brandData
    try {
      brandData = JSON.parse(responseText)
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (match) brandData = JSON.parse(match[0])
      else throw new Error('La IA no devolvió un JSON válido')
    }

    console.log(`✅ Brand Brain generado: ${brandData?.basico?.nombre || 'sin nombre'}`)

    // Guardar en DB
    let savedId = null
    try {
      const dbBrand = await saveBrand({
        nombre: brandData.basico?.nombre || 'Mi Marca',
        rubro: brandData.basico?.rubro || '',
        ciudad: brandData.basico?.ciudad || '',
        propuesta: brandData.basico?.propuesta || '',
        mision: brandData.estrategico?.mision || '',
        vision: brandData.estrategico?.vision || '',
        valores: (brandData.estrategico?.valores || []).join(', '),
        beneficiosFuncionales: brandData.estrategico?.beneficios_funcionales || '',
        beneficiosEmocionales: brandData.estrategico?.beneficios_emocionales || '',
        publico: brandData.audiencia?.publico_objetivo || '',
        audienciaReal: brandData.audiencia?.audiencia_real || '',
        painPoints: (brandData.audiencia?.pain_points || []).join(', '),
        gains: (brandData.audiencia?.gains || []).join(', '),
        motivaciones: brandData.audiencia?.motivaciones || '',
        comportamientoDigital: brandData.audiencia?.comportamiento_digital || '',
        voz_tono: brandData.identidad?.voz_tono || '',
        claim: brandData.identidad?.claim || '',
        narrativa: brandData.identidad?.narrativa || '',
        territorioCreativo: brandData.identidad?.territorio_creativo || '',
        tipografia_principal: brandData.visual?.tipografia || '',
        color_primario: brandData.visual?.colores?.primario || '',
        color_secundario: brandData.visual?.colores?.secundario || '',
        acentos: (brandData.visual?.colores?.acentos || []).join(', '),
        estilo_visual: brandData.visual?.estilo_visual || '',
        recursos_graficos: brandData.visual?.recursos_graficos || '',
        sistema_grafico: brandData.visual?.sistema_grafico || '',
        moodBoard: brandData.visual?.mood_board || '',
        competenciaDirecta: (brandData.posicionamiento?.competencia || []).join(', '),
        diferenciadores: (brandData.posicionamiento?.diferenciadores || []).join(', '),
        propuestaUnica: brandData.posicionamiento?.propuesta_unica || '',
        canales: (brandData.implementacion?.canales || []).join(', '),
        formatos: (brandData.implementacion?.formatos || []).join(', '),
        frecuencia: brandData.implementacion?.frecuencia || '',
        keywords: (brandData.comunicacion?.keywords || []).join(', '),
        avoid: (brandData.comunicacion?.avoid || []).join(', '),
        tonalidad: (brandData.comunicacion?.tonalidad || []).join(', '),
        ejemplos: brandData.comunicacion?.ejemplos || '',
        instagram_handle: instagramHandle || '',
        website_url: websiteUrl || '',
        data: brandData
      }, user.id)
      savedId = dbBrand?.id
    } catch (dbErr) {
      console.warn('DB save failed (non-critical):', dbErr.message)
    }

    return Response.json({
      success: true,
      brand: { ...brandData, id: savedId },
      sources: { images: allImages.length, pdfs: pdfs.length, website: !!websiteUrl, text: !!brandText }
    })

  } catch (error) {
    console.error('Error en auto-populate-brand:', error)
    return Response.json({ error: error.message || 'Error analizando la marca' }, { status: 500 })
  }
}

function extractWebContent(html) {
  const s = []
  const getMeta = (n) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${n}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${n}["']`, 'i'))
    return m ? m[1] : null
  }
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  const desc = getMeta('description') || getMeta('og:description')
  const og = getMeta('og:site_name')
  if (title) s.push(`Título: ${title}`)
  if (og) s.push(`Marca: ${og}`)
  if (desc) s.push(`Descripción: ${desc}`)

  const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []).join('')
  const hexes = [...new Set(css.match(/#[0-9a-fA-F]{4,6}\b/g) || [])].slice(0, 15)
  if (hexes.length) s.push(`Colores CSS: ${hexes.join(', ')}`)

  const fonts = (html.match(/family=([^&"']+)/gi) || []).map(f => decodeURIComponent(f.replace('family=','')).split(':')[0])
  if (fonts.length) s.push(`Tipografías: ${[...new Set(fonts)].join(', ')}`)

  const heads = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g,'').trim()).filter(t => t.length > 2 && t.length < 200).slice(0,15)
  if (heads.length) s.push(`Encabezados:\n${heads.join('\n')}`)

  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g,'').trim()).filter(t => t.length > 40 && t.length < 500).slice(0,8)
  if (paras.length) s.push(`Contenido:\n${paras.join('\n\n')}`)

  return s.join('\n\n')
}
