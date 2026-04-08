/**
 * POST /api/auto-populate-brand
 * Master orchestrator - calls analysis endpoints in parallel
 *
 * Input:
 * {
 *   images?: File[],
 *   instagram_handle?: "@username",
 *   website_url?: "https://example.com"
 * }
 *
 * Output:
 * {
 *   success: true,
 *   brand: {
 *     // Complete brain object ready to populate form
 *     nombre: "",
 *     rubro: "",
 *     color_primario: "#...",
 *     color_secundario: "#...",
 *     tipografia_principal: "...",
 *     // ... all other fields
 *     visualAssets: {
 *       analysis: {...}
 *     },
 *     metricas_redes: {...}
 *   }
 * }
 */

export async function POST(request) {
  try {
    const formData = await request.formData()

    const instagramHandle = formData.get('instagram_handle')
    const websiteUrl = formData.get('website_url')
    const files = formData.getAll('images')

    // Launch all analysis in parallel
    const promises = []

    // Image analysis
    if (files && files.length > 0) {
      promises.push(
        analyzeImages(files).catch(e => ({
          error: e.message,
          colors: [],
          typography: null,
          style: null
        }))
      )
    } else {
      promises.push(
        Promise.resolve({
          colors: [],
          typography: null,
          style: null
        })
      )
    }

    // Instagram analysis
    if (instagramHandle) {
      promises.push(
        fetchInstagramData(instagramHandle).catch(e => ({
          error: e.message,
          followers: 0,
          engagement_rate: 0
        }))
      )
    } else {
      promises.push(Promise.resolve(null))
    }

    // Website scraping
    if (websiteUrl) {
      promises.push(
        scrapeWebsiteData(websiteUrl).catch(e => ({
          error: e.message,
          detected_colors: [],
          detected_fonts: [],
          meta: {}
        }))
      )
    } else {
      promises.push(Promise.resolve(null))
    }

    // Wait for all analysis
    const [imageAnalysis, instagramData, websiteData] = await Promise.all(promises)

    // Consolidate into brand object
    const brandData = consolidateBrandData(imageAnalysis, instagramData, websiteData)

    return Response.json({
      success: true,
      brand: brandData,
      metadata: {
        analyzed_at: new Date().toISOString(),
        image_count: files?.length || 0,
        has_instagram: !!instagramHandle,
        has_website: !!websiteUrl
      }
    })
  } catch (error) {
    console.error('Error en /api/auto-populate-brand:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Call image analysis endpoint
 */
async function analyzeImages(files) {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const response = await fetch(new URL('/api/analyze-visual-assets', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Image analysis failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.analysis || {}
}

/**
 * Fetch Instagram data
 */
async function fetchInstagramData(handle) {
  const response = await fetch(new URL('/api/scrape-instagram', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: handle.replace('@', '') })
  })

  if (!response.ok) {
    throw new Error(`Instagram fetch failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.success ? data.data : null
}

/**
 * Scrape website data
 */
async function scrapeWebsiteData(url) {
  const response = await fetch(new URL('/api/scrape-website', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })

  if (!response.ok) {
    throw new Error(`Website scraping failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.success ? data.data : null
}

/**
 * Consolidate all analysis into a brain object
 */
function consolidateBrandData(imageAnalysis, instagramData, websiteData) {
  const brand = {
    // Basic info (user fills later)
    nombre: instagramData?.username || '',
    rubro: '',
    propuesta: '',

    // Colors (from images or website)
    color_primario: imageAnalysis?.colors?.[0]?.hex || websiteData?.detected_colors?.[0]?.hex || '#667eea',
    color_secundario: imageAnalysis?.colors?.[1]?.hex || websiteData?.detected_colors?.[1]?.hex || '#764ba2',
    acentos: [
      ...(imageAnalysis?.colors?.slice(2, 5) || []),
      ...(websiteData?.detected_colors?.slice(2, 5) || [])
    ].slice(0, 3),

    // Typography
    tipografia_principal: imageAnalysis?.typography?.family || websiteData?.detected_fonts?.[0]?.family || 'Gotham',
    tipografia_secundaria: websiteData?.detected_fonts?.[1]?.family || 'sans-serif',

    // Visual style
    estilo_visual: imageAnalysis?.style?.classification || websiteData?.detected_style || 'moderno',

    // Instagram metrics
    metricas_redes: {
      instagram_usuario: instagramData?.username || '',
      instagram_seguidores: instagramData?.followers || 0,
      instagram_engagement: instagramData?.engagement_rate || 0,
      mejor_horario: instagramData?.best_time || '',
      bio: instagramData?.bio || ''
    },

    // Website meta
    website_url: websiteData?.url || '',
    website_title: websiteData?.meta?.title || '',
    website_description: websiteData?.meta?.description || '',

    // Content structure
    content_structure: {
      ...(websiteData?.content_structure || {}),
      ...(imageAnalysis?.style || {})
    },

    // Visual assets
    visualAssets: {
      images: [],
      analysis: {
        colors: imageAnalysis?.colors || [],
        typography: imageAnalysis?.typography || {},
        style: imageAnalysis?.style || {},
        website_colors: websiteData?.detected_colors || [],
        website_fonts: websiteData?.detected_fonts || []
      }
    },

    // Empty fields for user to fill
    claim: '',
    propuesta_unica: '',
    diferenciadores: [],
    public: '',
    pain_points: [],
    motivaciones: '',
    voz_tono: '',
    registro: '',
    keywords: [],
    avoid: [],
    tonalidad: [],
    campana_exitosa: null,
    metricas_negocio: {},
    video_reels: {},
    recursos_graficos: [],
    estados_del_producto: [],

    // Metadata
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completeness: calculateCompleteness({
      color_primario: !!imageAnalysis?.colors?.[0],
      tipografia_principal: !!imageAnalysis?.typography?.family,
      estilo_visual: !!imageAnalysis?.style,
      instagram_seguidores: !!instagramData?.followers,
      website_url: !!websiteData?.url
    })
  }

  return brand
}

/**
 * Calculate completeness percentage
 */
function calculateCompleteness(fields) {
  const filled = Object.values(fields).filter(Boolean).length
  const total = Object.keys(fields).length
  return Math.round((filled / total) * 100)
}
