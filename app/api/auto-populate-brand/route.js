/**
 * POST /api/auto-populate-brand
 * Análisis completo de marca con Claude — como si fuera un equipo creativo senior
 *
 * Acepta: { files: [{name, type, data: base64}], websiteUrl, instagramHandle, brandText }
 * Retorna: { brand: {...}, departments: {...}, brief: "html" }
 */

import { getCurrentUser } from '@/lib/auth'
import { saveBrand } from '@/lib/brands-db'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// El prompt más importante del sistema — define cómo Claude analiza una marca
const BRAND_ANALYSIS_SYSTEM = `Eres un equipo creativo senior de una agencia de marketing completa. Tenés la experiencia acumulada de:
- Directora de Arte con 15 años en branding y diseño gráfico
- Estratega de contenido especializada en social media y tendencias
- Media Buyer con expertise en Facebook Ads, Google Ads e Instagram
- Community Manager con foco en engagement y crecimiento orgánico
- Director Creativo de producción de video y contenido audiovisual
- Planificador estratégico de campañas 360°
- Editor de video con conocimiento de tendencias virales

Tu tarea: analizar TODO el material de una marca y construir un Brand Brain completo y accionable para que CADA departamento de la agencia pueda trabajar con él sin ambigüedades.

Respondé SOLO con JSON válido sin markdown. El JSON debe ser exhaustivo — ningún campo puede quedar null si hay suficiente información para inferirlo.`

const BRAND_ANALYSIS_PROMPT = (sources) => `
Analizá toda esta información de marca y construí el Brand Brain completo.

${sources}

Devolvé este JSON exacto (completá TODOS los campos posibles):

{
  "basico": {
    "nombre": "nombre comercial de la marca",
    "rubro": "industria o sector específico (ej: Agencia de Marketing Digital, Indumentaria Urbana, Gastronomía)",
    "ciudad": "ciudad y país",
    "propuesta": "propuesta de valor en una oración poderosa"
  },
  "estrategico": {
    "mision": "misión de la marca",
    "vision": "visión a futuro",
    "valores": ["valor 1", "valor 2", "valor 3", "valor 4"],
    "beneficios_funcionales": "qué problema concreto resuelve",
    "beneficios_emocionales": "cómo hace sentir a quien lo usa/contrata"
  },
  "audiencia": {
    "publico_objetivo": "perfil demográfico detallado: edad, género, nivel socioeconómico, ubicación",
    "audiencia_real": "quién realmente compra hoy vs quién debería comprar",
    "pain_points": ["problema 1 que sufre la audiencia", "problema 2", "problema 3"],
    "gains": ["beneficio 1 que busca", "beneficio 2", "beneficio 3"],
    "motivaciones": "qué los impulsa a actuar: miedo, aspiración, identidad, conveniencia",
    "comportamiento_digital": "qué redes usa, cómo consume contenido, en qué horarios, qué sigue"
  },
  "identidad": {
    "voz_tono": "cómo habla la marca en 3-5 adjetivos (ej: directo, cálido, experto, con humor)",
    "claim": "tagline o claim de la marca",
    "narrativa": "historia de la marca — de dónde viene, por qué existe, adónde va",
    "territorio_creativo": "universo conceptual y emocional donde vive la marca"
  },
  "visual": {
    "tipografia": "tipografía principal (ej: Gotham Bold para títulos, Montserrat Regular para cuerpo)",
    "colores": {
      "primario": "#RRGGBB",
      "secundario": "#RRGGBB",
      "acentos": ["#RRGGBB", "#RRGGBB"]
    },
    "estilo_visual": "descriptor del estilo (ej: minimalista con toques bold, oscuro y premium, colorido y dinámico)",
    "recursos_graficos": "elementos gráficos de la marca: iconos de línea, ilustraciones, formas geométricas, gradientes, texturas, fotografía editorial",
    "sistema_grafico": "cómo se construyen las piezas: grillas, proporciones, uso del espacio negativo",
    "mood_board": "palabras que describen el mood visual: oscuro, premium, elegante, fresco, energético, etc."
  },
  "posicionamiento": {
    "competencia": ["competidor directo 1", "competidor directo 2", "competidor indirecto"],
    "diferenciadores": ["qué los hace únicos 1", "diferenciador 2", "diferenciador 3"],
    "propuesta_unica": "UVP — la única razón por la que este cliente elegiría esta marca sobre todas las demás"
  },
  "implementacion": {
    "canales": ["Instagram", "LinkedIn", "Email", "TikTok", "YouTube", "etc."],
    "formatos": ["Reels", "Carrusel", "Stories", "Static Post", "Newsletter", "etc."],
    "frecuencia": "frecuencia de publicación recomendada por canal"
  },
  "comunicacion": {
    "keywords": ["palabra clave 1", "palabra clave 2", "palabra clave 3", "palabra clave 4", "palabra clave 5"],
    "avoid": ["palabra o frase a evitar 1", "a evitar 2", "a evitar 3"],
    "tonalidad": ["característica 1", "característica 2", "característica 3"],
    "ejemplos": "ejemplo de copy que refleje perfectamente la voz de la marca (1-3 frases reales)"
  },
  "departamentos": {
    "diseno_grafico": {
      "paleta_completa": "descripción de toda la paleta con usos: primario para fondos, secundario para tipografía, acento para CTAs",
      "tipografia_guia": "guía de uso: cuándo usar cada peso y tamaño",
      "estilo_fotografia": "cómo deben ser las fotos: iluminación, composición, temática, qué NO usar",
      "iconografia": "estilo de íconos: grosor de línea, relleno o outline, si usar o no",
      "dos_and_donts": ["✅ Sí: uso correcto 1", "✅ Sí: uso correcto 2", "❌ No: error común 1", "❌ No: error común 2"],
      "referencias_visuales": "marcas o estilos visuales de referencia para inspiración"
    },
    "social_media": {
      "pilares_contenido": ["Pilar 1: nombre y descripción", "Pilar 2", "Pilar 3", "Pilar 4"],
      "calendario_sugerido": "estructura de la semana: lunes educacional, miércoles entretenimiento, viernes CTA, etc.",
      "formatos_por_plataforma": "Instagram: Reels + carrusel | LinkedIn: artículos + posts nativos | TikTok: tendencias adaptadas",
      "copy_style": "cómo escribir captions: extensión, emojis, CTAs, hashtags",
      "tendencias_aplicables": "tendencias actuales que la marca puede aprovechar",
      "metricas_clave": "qué medir: engagement rate, alcance, saves, DMs, clics en bio"
    },
    "paid_media": {
      "audiencias_facebook": "intereses, comportamientos y demografía para armar audiencias en Meta",
      "audiencias_google": "keywords de búsqueda, intención comercial, match types",
      "mensajes_por_objetivo": {
        "awareness": "mensaje para quienes no conocen la marca",
        "consideracion": "mensaje para quienes la conocen pero no compraron",
        "conversion": "mensaje para llevarlos a la acción"
      },
      "formatos_ads": "qué formatos funcionan mejor para esta marca: video, carrusel, imagen estática, story",
      "presupuesto_sugerido": "distribución sugerida del presupuesto: % branding vs % conversión",
      "copy_ads": "ejemplo de headline y descripción para un anuncio de conversión"
    },
    "content": {
      "topicos_principales": ["tema evergreen 1", "tema de tendencia", "tema educacional", "caso de éxito"],
      "seo_keywords": ["keyword principal", "keyword secundaria", "keyword long tail"],
      "estructura_contenido": "cómo estructurar los posts/artículos: hook, desarrollo, CTA",
      "voz_escrita": "cómo escribir: ¿tuteás o ustedeás? ¿emojis? ¿humor? ¿datos y estadísticas?",
      "contenido_viral": "qué tipo de contenido tiene más potencial viral para esta marca"
    },
    "video": {
      "estilo_visual": "ritmo del video, tipo de cortes, transiciones, motion graphics",
      "musica_mood": "tipo de música: energética, ambient, trap, folklore, sin música, etc.",
      "duracion_formato": "duración por formato: Reels 7-15s, TikTok 15-30s, YouTube 3-8min",
      "referencias_videos": "marcas o creadores cuyo estilo de video es referencia",
      "hook_visual": "cómo atrapar al espectador en los primeros 3 segundos",
      "texto_en_pantalla": "si usar subtítulos, captions, overlays de texto y cómo"
    },
    "community_management": {
      "tono_respuestas": "cómo responder comentarios: formal/informal, con emojis, con humor, siempre empático",
      "protocolo_crisis": "cómo manejar comentarios negativos o crisis de reputación",
      "frases_aprobadas": ["frase de bienvenida", "respuesta a reclamos", "incentivo de compra"],
      "palabras_clave_monitorear": ["keyword a monitorear 1", "keyword 2", "hashtag propio"],
      "engagement_proactivo": "estrategia para generar interacción: preguntas, encuestas, challenges",
      "horarios_optimos": "mejores horarios para publicar y responder según la audiencia"
    }
  }
}
`

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { files = [], instagramHandle = '', websiteUrl = '', brandText = '' } = body

    const hasInput = files.length > 0 || instagramHandle || websiteUrl || brandText
    if (!hasInput) {
      return Response.json({ error: 'Se requiere al menos una fuente de información' }, { status: 400 })
    }

    console.log('🚀 Iniciando análisis de marca...')
    const sources = []

    // 1. Texto libre de la marca
    if (brandText?.trim()) {
      sources.push(`## INFORMACIÓN PROPORCIONADA POR EL CLIENTE\n${brandText}`)
    }

    // 2. Instagram handle — mencionar como referencia
    if (instagramHandle?.trim()) {
      const cleanHandle = instagramHandle.replace('@', '').trim()
      sources.push(`## INSTAGRAM\nHandle: @${cleanHandle}\nPerfil público en: https://www.instagram.com/${cleanHandle}/\nUsá tu conocimiento sobre esta marca si la conocés.`)
    }

    // 3. Sitio web — scrape real
    if (websiteUrl?.trim()) {
      try {
        let url = websiteUrl.trim()
        if (!url.startsWith('http')) url = 'https://' + url

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 12000)

        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
          signal: controller.signal
        })
        clearTimeout(timeout)

        const html = await response.text()
        const webContent = extractWebContent(html, url)
        sources.push(`## SITIO WEB: ${url}\n${webContent}`)
        console.log(`✅ Sitio scrapeado: ${webContent.length} chars`)
      } catch (err) {
        console.warn('No se pudo scrape:', err.message)
        sources.push(`## SITIO WEB\nURL proporcionada: ${websiteUrl} (no se pudo acceder automáticamente)`)
      }
    }

    // 4. Archivos (imágenes y PDFs) — pasar a Claude directamente
    const messageContent = []
    const imageFiles = []
    const pdfFiles = []

    for (const file of files) {
      if (!file.data) continue

      if (file.type?.startsWith('image/')) {
        imageFiles.push(file)
      } else if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
        pdfFiles.push(file)
      }
    }

    // Agregar PDFs como documentos
    for (const pdf of pdfFiles.slice(0, 3)) {
      messageContent.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: pdf.data }
      })
    }

    // Agregar imágenes como vision
    for (const img of imageFiles.slice(0, 10)) {
      const mediaType = img.type || 'image/jpeg'
      messageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: img.data }
      })
    }

    const hasBinary = messageContent.length > 0
    const betaHeader = pdfFiles.length > 0 ? 'pdfs-2024-09-25' : undefined

    // Agregar texto con todas las fuentes
    const sourcesText = sources.join('\n\n---\n\n') || 'Analizá los archivos adjuntos.'
    messageContent.push({
      type: 'text',
      text: BRAND_ANALYSIS_PROMPT(sourcesText)
    })

    console.log(`📊 Analizando: ${imageFiles.length} imágenes, ${pdfFiles.length} PDFs, ${sources.length} fuentes de texto`)

    // Llamada principal a Claude
    const apiOptions = {
      model: 'claude-opus-4-5',
      max_tokens: 8000,
      system: BRAND_ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: messageContent }]
    }

    if (betaHeader) {
      apiOptions.betas = ['pdfs-2024-09-25']
    }

    const message = await client.messages.create(apiOptions)
    let responseText = message.content[0].text.trim()

    // Limpiar markdown
    responseText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let brandData
    try {
      brandData = JSON.parse(responseText)
    } catch (e) {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (match) brandData = JSON.parse(match[0])
      else throw new Error('Claude no devolvió JSON válido')
    }

    console.log(`✅ Brand Brain generado para: ${brandData?.basico?.nombre || 'marca'}`)

    // Guardar en DB
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
      data: brandData // guardar todo el objeto para los departamentos
    }, user.id)

    return Response.json({
      success: true,
      brand: { ...brandData, id: dbBrand.id },
      analysis: { sources: sources.length, images: imageFiles.length, pdfs: pdfFiles.length }
    })

  } catch (error) {
    console.error('Error en auto-populate-brand:', error)
    return Response.json({ error: error.message || 'Error analizando la marca' }, { status: 500 })
  }
}

function extractWebContent(html, url) {
  const sections = []
  const getMeta = (name) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
    return m ? m[1] : null
  }

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
  const description = getMeta('description') || getMeta('og:description')
  const ogSiteName = getMeta('og:site_name')

  if (title) sections.push(`Título: ${title}`)
  if (ogSiteName) sections.push(`Nombre: ${ogSiteName}`)
  if (description) sections.push(`Descripción: ${description}`)

  const allCss = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []).join('\n')
  const hexColors = [...new Set(allCss.match(/#[0-9a-fA-F]{4,6}\b/g) || [])].slice(0, 15)
  if (hexColors.length > 0) sections.push(`Colores CSS detectados: ${hexColors.join(', ')}`)

  const googleFonts = html.match(/family=([^&"']+)/gi) || []
  if (googleFonts.length > 0) sections.push(`Tipografías: ${googleFonts.map(f => decodeURIComponent(f.replace('family=', '')).split(':')[0]).join(', ')}`)

  const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 2 && t.length < 200)
    .slice(0, 15)
  if (headings.length > 0) sections.push(`Encabezados:\n${headings.join('\n')}`)

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 40 && t.length < 500)
    .slice(0, 8)
  if (paragraphs.length > 0) sections.push(`Contenido:\n${paragraphs.join('\n\n')}`)

  return sections.join('\n\n')
}
