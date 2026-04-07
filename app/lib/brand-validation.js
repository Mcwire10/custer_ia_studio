/**
 * Brand Validation Library
 * Valida, consolida y analiza datos de marca desde múltiples fuentes
 */

// Delta-E (CIE 76) para comparar colores - determina si dos colores son "iguales"
function deltaE76(lab1, lab2) {
  const dL = lab1[0] - lab2[0]
  const da = lab1[1] - lab2[1]
  const db = lab1[2] - lab2[2]
  return Math.sqrt(dL * dL + da * da + db * db)
}

// Convertir RGB a LAB para comparación perceptual
function rgbToLab(r, g, b) {
  // Normalizar RGB
  r = r / 255
  g = g / 255
  b = b / 255

  // RGB to XYZ
  if (r > 0.04045) r = Math.pow((r + 0.055) / 1.055, 2.4)
  else r = r / 12.92
  if (g > 0.04045) g = Math.pow((g + 0.055) / 1.055, 2.4)
  else g = g / 12.92
  if (b > 0.04045) b = Math.pow((b + 0.055) / 1.055, 2.4)
  else b = b / 12.92

  let x = r * 0.4124 + g * 0.3576 + b * 0.1805
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722
  let z = r * 0.0193 + g * 0.1192 + b * 0.9505

  // XYZ to LAB
  x = x / 0.95047
  y = y / 1.0
  z = z / 1.08883

  if (x > 0.008856) x = Math.pow(x, 1 / 3)
  else x = (7.787 * x) + (16 / 116)
  if (y > 0.008856) y = Math.pow(y, 1 / 3)
  else y = (7.787 * y) + (16 / 116)
  if (z > 0.008856) z = Math.pow(z, 1 / 3)
  else z = (7.787 * z) + (16 / 116)

  const L = (116 * y) - 16
  const a = 500 * (x - y)
  const b_lab = 200 * (y - z)

  return [L, a, b_lab]
}

// Convertir HEX a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null
}

/**
 * Calcula contraste WCAG entre dos colores (ratio 1-21)
 */
export function calculateContrast(hex1, hex2) {
  const getLuminance = (hex) => {
    const [r, g, b] = hexToRgb(hex)
    const [rs, gs, bs] = [r, g, b].map(v => {
      v = v / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2)
}

/**
 * Valida si una tipografía es Google Fonts, web-safe, o custom
 */
export function validateBrandTypography(fontSuggestion) {
  const googleFonts = [
    'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Raleway',
    'Playfair Display', 'Inter', 'Poppins', 'Ubuntu', 'Nunito',
    'Gotham', 'Helvetica', 'Arial', 'Times New Roman', 'Georgia',
    'Courier New', 'Trebuchet MS', 'Verdana', 'Comic Sans MS', 'Impact'
  ]

  const webSafe = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
    'Trebuchet MS', 'Verdana', 'Comic Sans MS', 'Impact', 'Lucida Console',
    'Palatino Linotype', 'Lucida Calligraphy'
  ]

  const normalized = fontSuggestion?.trim() || 'sans-serif'

  // Check if it's a known font
  const isGoogle = googleFonts.some(f => normalized.toLowerCase().includes(f.toLowerCase()))
  const isWebSafe = webSafe.some(f => normalized.toLowerCase().includes(f.toLowerCase()))

  return {
    valid: normalized !== 'sans-serif',
    familia: normalized,
    fallback: 'sans-serif',
    peso_recomendado: ['400', '600', '700'],
    fuente: isGoogle ? 'google-fonts' : isWebSafe ? 'web-safe' : 'custom',
    variantes_disponibles: ['400', '400i', '600', '600i', '700', '700i'],
    confianza: isGoogle || isWebSafe ? 95 : 60
  }
}

/**
 * Consolida colores desde análisis de múltiples imágenes
 * Agrupa colores similares (Delta-E < 5) y les asigna roles
 */
export function consolidateColors(coloresArray) {
  if (!coloresArray || coloresArray.length === 0) {
    return {
      primario: null,
      secundario: null,
      acentos: [],
      sugerencias: ['Cargar imágenes de marca para detectar colores automáticamente']
    }
  }

  // Convertir todos los colores a LAB para comparación perceptual
  const coloresConLab = coloresArray.map(color => ({
    ...color,
    lab: rgbToLab(...hexToRgb(color.hex.replace(/[()]/g, '').split(',').map(v => parseInt(v))))
  }))

  // Agrupar colores similares (Delta-E < 5)
  const grupos = []
  const procesados = new Set()

  coloresConLab.forEach((color, idx) => {
    if (procesados.has(idx)) return

    const grupo = [color]
    procesados.add(idx)

    coloresConLab.forEach((otroColor, otroIdx) => {
      if (procesados.has(otroIdx)) return
      if (deltaE76(color.lab, otroColor.lab) < 5) {
        grupo.push(otroColor)
        procesados.add(otroIdx)
      }
    })

    grupos.push(grupo)
  })

  // Seleccionar color representativo de cada grupo (más frecuente)
  const coloresPrincipales = grupos.map(grupo => {
    const sorted = grupo.sort((a, b) => (b.frecuencia || 1) - (a.frecuencia || 1))
    return {
      ...sorted[0],
      frecuencia: grupo.reduce((sum, c) => sum + (c.frecuencia || 1), 0),
      variaciones: grupo.length > 1 ? grupo.map(c => c.hex) : []
    }
  }).sort((a, b) => b.frecuencia - a.frecuencia)

  // Asignar roles basados en frecuencia y saturación
  const result = {
    primario: coloresPrincipales[0] || null,
    secundario: coloresPrincipales[1] || null,
    acentos: coloresPrincipales.slice(2, 5) || [],
    sugerencias: []
  }

  // Validar contraste accesibilidad
  if (result.primario && result.primario.hex) {
    const contrast = calculateContrast(result.primario.hex, '#FFFFFF')
    if (contrast < 4.5) {
      result.sugerencias.push(`⚠️ Color primario tiene contraste ${contrast}:1 con blanco (WCAG AA requiere 4.5:1)`)
    }
  }

  return result
}

/**
 * Verifica consistencia visual entre datos de formulario y análisis de imágenes
 */
export function checkConsistency(formData, visualAnalysis) {
  const inconsistencias = []
  const hallazgos = []

  // Verificar colores
  if (formData.color_primario && visualAnalysis.colores?.primario) {
    const formColor = formData.color_primario.replace(/[()]/g, '').split(',').map(v => parseInt(v))
    const analysisColor = visualAnalysis.colores.primario.hex.replace(/[()]/g, '').split(',').map(v => parseInt(v))
    const distance = deltaE76(rgbToLab(...formColor), rgbToLab(...analysisColor))

    if (distance > 10) {
      inconsistencias.push({
        campo: 'color_primario',
        forma: formData.color_primario,
        analisis: visualAnalysis.colores.primario.hex,
        distancia: distance.toFixed(1)
      })
    } else {
      hallazgos.push(`✅ Color primario consistente en formulario e imágenes`)
    }
  }

  // Verificar tipografía
  if (formData.tipografia_principal && visualAnalysis.tipografia?.[0]) {
    const formFont = formData.tipografia_principal.toLowerCase()
    const analysisFont = visualAnalysis.tipografia[0].familia?.toLowerCase()

    if (formFont !== analysisFont && !formFont.includes(analysisFont?.split(' ')[0])) {
      inconsistencias.push({
        campo: 'tipografia_principal',
        forma: formData.tipografia_principal,
        analisis: visualAnalysis.tipografia[0].familia
      })
    } else {
      hallazgos.push(`✅ Tipografía consistente en formulario e imágenes`)
    }
  }

  // Verificar estilo visual
  if (formData.estilo_visual && visualAnalysis.fotografia?.estilo) {
    if (formData.estilo_visual.toLowerCase() !== visualAnalysis.fotografia.estilo.toLowerCase()) {
      inconsistencias.push({
        campo: 'estilo_visual',
        forma: formData.estilo_visual,
        analisis: visualAnalysis.fotografia.estilo
      })
    } else {
      hallazgos.push(`✅ Estilo visual consistente`)
    }
  }

  return { inconsistencias, hallazgos }
}

/**
 * Asigna puntuaciones de confianza a datos detectados
 */
export function assignConfidenceScores(analysisData) {
  const scores = {
    colores: 0,
    tipografia: 0,
    estilo_visual: 0,
    general: 0
  }

  // Confianza en colores: basada en frecuencia y consistencia
  if (analysisData.colores && analysisData.colores.length > 0) {
    const maxFreq = Math.max(...analysisData.colores.map(c => c.frecuencia || 1))
    scores.colores = Math.round((maxFreq / (maxFreq + 5)) * 100)
  }

  // Confianza en tipografía: basada en legibilidad
  if (analysisData.tipografia && analysisData.tipografia.length > 0) {
    const font = analysisData.tipografia[0]
    const knownFonts = ['Montserrat', 'Gotham', 'Arial', 'Helvetica', 'Inter', 'Roboto']
    const isKnown = knownFonts.some(f => font.familia?.includes(f))
    scores.tipografia = isKnown ? 90 : 60
  }

  // Confianza en estilo: basada en claridad de descripción
  if (analysisData.fotografia?.estilo) {
    const validStyles = ['moderno', 'clásico', 'minimalista', 'corporativo', 'creativo']
    const isValid = validStyles.includes(analysisData.fotografia.estilo.toLowerCase())
    scores.estilo_visual = isValid ? 85 : 65
  }

  // Puntuación general
  const values = Object.values(scores).filter(v => typeof v === 'number')
  scores.general = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

  return scores
}

/**
 * Genera próximos pasos basados en análisis
 */
export function generateNextSteps(report) {
  const steps = []

  // Colores
  if (report.colores?.primario?.confianza < 70) {
    steps.push('🔍 Revisar y confirmar colores primarios detectados')
  }
  if (report.colores?.sugerencias?.length > 0) {
    steps.push(`⚠️ Resolver: ${report.colores.sugerencias[0]}`)
  }

  // Tipografía
  if (report.tipografia?.principal?.confianza < 80) {
    steps.push('🔤 Confirmar tipografía principal (¿es realmente ' + report.tipografia.principal.familia + '?)')
  }
  if (report.tipografia?.principal?.fuente === 'custom') {
    steps.push('📥 Considerar usar tipografía web-safe o Google Fonts para mejor compatibilidad')
  }

  // Consistencia
  if (report.consistencia?.score < 70) {
    steps.push('🔗 Resolver inconsistencias entre formulario e imágenes')
  }

  // Accesibilidad
  if (!steps.some(s => s.includes('contraste'))) {
    steps.push('♿ Validar contraste de colores para accesibilidad (WCAG AA)')
  }

  // Próximos pasos generales
  if (steps.length === 0) {
    steps.push('✅ Datos de marca consistentes y validados')
    steps.push('🎨 Listos para generar diseños con identidad de marca')
  }

  return steps
}
