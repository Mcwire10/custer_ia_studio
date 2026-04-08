/**
 * Shared prompt schemas and utilities for API endpoints
 * Purpose: Reduce token count by centralizing schema definitions
 * Impact: ~1,200 tokens saved across 3 endpoints
 */

// Compact schema definition - maps to expected JSON structure
export const BRAND_SCHEMA_KEYS = {
  basico: ['nombre', 'rubro', 'ciudad', 'propuesta'],
  estrategico: ['mision', 'vision', 'valores', 'beneficios_funcionales', 'beneficios_emocionales'],
  audiencia: ['publico_objetivo', 'audiencia_real', 'pain_points', 'gains', 'motivaciones', 'comportamiento_digital'],
  identidad: ['personalidad', 'tono', 'voz', 'valores_operacionales', 'comportamientos'],
  visual: ['colores_principales', 'colores_secundarios', 'tipografia_principal', 'tipografia_secundaria', 'elementos_visuales'],
  posicionamiento: ['posicion_mercado', 'diferenciadores', 'ventajas_competitivas'],
  implementacion: ['canales_principales', 'prioritarios_corto_plazo'],
  comunicacion: ['mensajes_clave', 'arquitectura_de_marca', 'storytelling']
};

// Compact instruction for schema compliance - replaces 57-line verbose example
export const COMPACT_SCHEMA_INSTRUCTION =
  'Return JSON with keys: basico(nombre,rubro,ciudad,propuesta), estrategico(mision,vision,valores[],beneficios_funcionales,beneficios_emocionales), ' +
  'audiencia(publico_objetivo,audiencia_real,pain_points[],gains[],motivaciones,comportamiento_digital), ' +
  'identidad(personalidad,tono,voz,valores_operacionales,comportamientos), ' +
  'visual(colores_principales,colores_secundarios,tipografia_principal,tipografia_secundaria,elementos_visuales), ' +
  'posicionamiento(posicion_mercado,diferenciadores,ventajas_competitivas), ' +
  'implementacion(canales_principales,prioritarios_corto_plazo), ' +
  'comunicacion(mensajes_clave,arquitectura_de_marca,storytelling). ' +
  'Use null for missing fields, [] for empty arrays.';

/**
 * Create a standardized system prompt
 * Reduces redundancy across copy, competition, validate, reports endpoints
 * @param {string} role - The role/expertise of the AI
 * @param {string} context - Optional context about the brand or task
 * @param {string} responseFormat - Optional format specification
 * @returns {string} Complete system prompt
 */
export function createStandardSystemPrompt(role, context = '', responseFormat = '') {
  let prompt = `Eres ${role}.`;
  if (context) prompt += ` Context: ${context}.`;
  prompt += ' Responde SOLO JSON válido sin markdown ni explicaciones.';
  if (responseFormat) prompt += ` Formato: ${responseFormat}`;
  return prompt;
}

/**
 * Helper to create visual identity analysis prompt
 * Optimized for analyze-visual-identity endpoint
 */
export function getVisualIdentityPrompt(brandName, imageCount) {
  return {
    analysis_task: 'visual identity extraction',
    key_requirements: [
      `Analiza ${imageCount} imágenes de marca para "${brandName || 'marca sin nombre'}"`,
      'Identifica tipografías reales si las reconoces',
      'Extrae 5-7 colores principales con códigos hex específicos',
      'Describe tratamiento fotográfico y elementos gráficos',
      'Proporciona análisis profesional y consistente'
    ],
    response_structure: {
      colores: '[{hex, rgb, nombre, uso, frecuencia}]',
      tipografia: '[{nombre, uso}]',
      fotografia: '{}',
      elementos_graficos: '{}',
      sistema_visual: '{}',
      recomendaciones: '{}',
      resumen: 'string'
    }
  };
}

/**
 * Default max_tokens for each endpoint
 * Optimized values assume Haiku model with reduced prompts
 */
export const ENDPOINT_MAX_TOKENS = {
  'generate': 1600,          // Reduced from 2000 (mockups are structured)
  'validate': 400,           // Reduced from 500 (JSON validation is simple)
  'process-brand-text': 1500, // Reduced from 2000 (JSON structure is standard)
  'analyze-visual-identity': 2000, // Reduced from 2500 (can be verbose but not excessively)
  'copy': 400,               // Reduced from 500
  'competition': 400,        // Reduced from 500
  'parse-brand-file': 1500,  // Reduced from 2000
  'assistant-context': 800,  // Reduced from 1000
  'reports': 400             // Reduced from 500
};

/**
 * Fallback max_tokens if optimization is not enabled
 * Use for backwards compatibility
 */
export const ORIGINAL_MAX_TOKENS = {
  'generate': 2000,
  'validate': 500,
  'process-brand-text': 2000,
  'analyze-visual-identity': 2500,
  'copy': 500,
  'competition': 500,
  'parse-brand-file': 2000,
  'assistant-context': 1000,
  'reports': 500
};

/**
 * Helper to get appropriate max_tokens
 * @param {string} endpoint - API endpoint name
 * @param {boolean} optimized - Use optimized values (default: true)
 */
export function getMaxTokens(endpoint, optimized = true) {
  const tokens = optimized ? ENDPOINT_MAX_TOKENS : ORIGINAL_MAX_TOKENS;
  return tokens[endpoint] || 1500;
}

/**
 * Helper to create model config
 * Standardizes model selection across all endpoints
 */
export function getModelConfig() {
  return {
    model: 'claude-3-5-haiku-20241022',
    temperature: 0.7,
    top_p: 1
  };
}

export default {
  BRAND_SCHEMA_KEYS,
  COMPACT_SCHEMA_INSTRUCTION,
  createStandardSystemPrompt,
  getVisualIdentityPrompt,
  ENDPOINT_MAX_TOKENS,
  ORIGINAL_MAX_TOKENS,
  getMaxTokens,
  getModelConfig
};
