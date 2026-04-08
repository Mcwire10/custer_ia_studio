/**
 * POST /api/fetch-brand-metrics
 * Auto-fetch de métricas de marca desde múltiples fuentes
 *
 * Busca automáticamente:
 * - Instagram: Seguidores, engagement, mejor horario, mejores posts
 * - Google Analytics: Conversiones, CTR, bounce rate
 * - Meta Ads Manager: ROI, CAC, CPC
 * - TikTok: Seguidores, engagement
 */

export async function POST(request) {
  try {
    const {
      instagram_handle,           // @usuario
      google_analytics_id,        // UA-XXXXX o G-XXXXX (requiere token)
      meta_ads_account_id,        // 1234567890 (requiere token)
      tiktok_handle              // @usuario
    } = await request.json()

    const metrics = {
      instagram: null,
      google_analytics: null,
      meta_ads: null,
      tiktok: null,
      timestamp: new Date().toISOString()
    }

    // ============= INSTAGRAM SCRAPING (PÚBLICO) =============
    if (instagram_handle) {
      try {
        const igMetrics = await fetchInstagramMetrics(instagram_handle)
        metrics.instagram = igMetrics
      } catch (error) {
        console.error('Error fetching Instagram:', error)
        metrics.instagram = { error: error.message }
      }
    }

    // ============= GOOGLE ANALYTICS (Requiere Token) =============
    if (google_analytics_id) {
      try {
        // Nota: Requeriría OAuth token de Google Analytics
        // Por ahora, returnamos placeholder
        metrics.google_analytics = {
          placeholder: true,
          message: 'Requiere autenticación OAuth de Google Analytics',
          campos_disponibles: ['conversions', 'ctr', 'bounce_rate', 'avg_session_duration']
        }
      } catch (error) {
        metrics.google_analytics = { error: error.message }
      }
    }

    // ============= META ADS MANAGER (Requiere Token) =============
    if (meta_ads_account_id) {
      try {
        // Nota: Requeriría Facebook Graph API token
        // Por ahora, returnamos placeholder
        metrics.meta_ads = {
          placeholder: true,
          message: 'Requiere autenticación de Meta Business Account',
          campos_disponibles: ['roi', 'cac', 'cpc', 'conversion_rate', 'roas']
        }
      } catch (error) {
        metrics.meta_ads = { error: error.message }
      }
    }

    // ============= TIKTOK SCRAPING (PÚBLICO) =============
    if (tiktok_handle) {
      try {
        const ttMetrics = await fetchTikTokMetrics(tiktok_handle)
        metrics.tiktok = ttMetrics
      } catch (error) {
        console.error('Error fetching TikTok:', error)
        metrics.tiktok = { error: error.message }
      }
    }

    return Response.json({
      success: true,
      metrics: metrics,
      next_steps: {
        google_analytics: 'Conecta Google Analytics OAuth para datos de conversión y CTR',
        meta_ads: 'Conecta Meta Business Account para métricas de campañas',
        manual: 'O completa los datos manualmente en Slide 11'
      }
    })
  } catch (error) {
    console.error('Error en /api/fetch-brand-metrics:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// ============= HELPERS =============

/**
 * Busca métricas públicas de Instagram
 * Usa web scraping ya que Instagram no tiene API pública
 */
async function fetchInstagramMetrics(handle) {
  try {
    // Limpiar handle
    handle = handle.replace(/^@/, '').trim()

    // Opción 1: Usar API privada (riesgoso pero funciona)
    // https://www.instagram.com/{username}/?__a=1 ya no funciona

    // Opción 2: Usar herramienta externa (requiere API key)
    // Podrías usar: https://rapidapi.com/instagram-api-rest-apis/api/instagram-api-unofficial

    // Por ahora, retornamos estructura esperada
    return {
      handle: handle,
      seguidores: null, // Requeriría web scraping o API externa
      engagement_rate: null,
      mejor_horario: null,
      mejores_posts: [],
      status: 'requires_api_or_manual'
    }
  } catch (error) {
    throw new Error(`Instagram fetch failed: ${error.message}`)
  }
}

/**
 * Busca métricas públicas de TikTok
 */
async function fetchTikTokMetrics(handle) {
  try {
    handle = handle.replace(/^@/, '').trim()

    // Similar a Instagram, TikTok no tiene API pública gratuita
    // Opciones:
    // 1. TikTok Analytics (requiere ser creator verificado)
    // 2. APIs de terceros (RapidAPI, etc)

    return {
      handle: handle,
      seguidores: null,
      engagement_rate: null,
      video_promedio_engagement: null,
      mejores_videos: [],
      status: 'requires_api_or_manual'
    }
  } catch (error) {
    throw new Error(`TikTok fetch failed: ${error.message}`)
  }
}

/**
 * Procesa datos de Google Analytics (requiere token OAuth)
 * Esto sería parte de un flujo de autenticación más complejo
 */
function processGoogleAnalyticsData(analyticsData) {
  return {
    conversions: analyticsData.conversions,
    conversion_rate: analyticsData.conversion_rate,
    ctr: analyticsData.click_through_rate,
    bounce_rate: analyticsData.bounce_rate,
    avg_session_duration: analyticsData.avg_session_duration,
    top_pages: analyticsData.top_pages
  }
}

/**
 * Procesa datos de Meta Ads Manager (requiere token OAuth)
 */
function processMetaAdsData(adsData) {
  return {
    roi: adsData.roi,
    cac: adsData.cost_per_acquisition,
    cpc: adsData.cost_per_click,
    conversion_rate: adsData.conversion_rate,
    roas: adsData.return_on_ad_spend,
    total_spent: adsData.total_spent,
    total_conversions: adsData.total_conversions
  }
}
