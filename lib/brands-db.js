/**
 * Brands Database Functions
 * Manages MySQL operations for brand persistence
 */

import { getPool } from './db.js'

/**
 * Save new brand to database (con user_id)
 * @param {Object} brandData - Datos de la marca
 * @param {number} userId - ID del usuario
 */
export async function saveBrand(brandData, userId) {
  const pool = getPool()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const {
      nombre,
      rubro,
      propuesta,
      color_primario,
      color_secundario,
      tipografia_principal,
      estilo_visual,
      data
    } = brandData

    const query = `
      INSERT INTO brands (
        user_id,
        name,
        rubro,
        propuesta,
        color_primario,
        color_secundario,
        tipografia_principal,
        estilo_visual,
        data,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const [result] = await pool.execute(query, [
      userId,
      nombre,
      rubro,
      propuesta,
      color_primario,
      color_secundario,
      tipografia_principal,
      estilo_visual,
      JSON.stringify(data || {})
    ])

    return {
      id: result.insertId,
      name: nombre,
      user_id: userId,
      created_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error saving brand:', error)
    throw error
  }
}

/**
 * Get brands por usuario
 * @param {number} userId - ID del usuario
 */
export async function getBrandsByUser(userId) {
  const pool = getPool()

  try {
    const query = `
      SELECT
        id,
        name,
        updated_at,
        color_primario
      FROM brands
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 100
    `

    const [rows] = await pool.execute(query, [userId])

    return rows.map(brand => ({
      id: brand.id,
      name: brand.name,
      updated_at: brand.updated_at,
      thumbnail: brand.color_primario || '#667eea'
    }))
  } catch (error) {
    console.error('Error getting brands by user:', error)
    throw error
  }
}

/**
 * Get brand by ID (con validación de usuario)
 * @param {number} id - Brand ID
 * @param {number} userId - User ID para validación
 */
export async function getBrand(id, userId) {
  const pool = getPool()

  try {
    const query = `
      SELECT * FROM brands WHERE id = ? AND user_id = ?
    `

    const [rows] = await pool.execute(query, [id, userId])

    if (rows.length === 0) {
      return null
    }

    const brand = rows[0]
    return parseBrand(brand)
  } catch (error) {
    console.error('Error getting brand:', error)
    throw error
  }
}

/**
 * Get brand by name
 */
export async function getBrandByName(name) {
  const pool = getPool()

  try {
    const query = `
      SELECT * FROM brands WHERE name = ?
    `

    const [rows] = await pool.execute(query, [name])

    if (rows.length === 0) {
      return null
    }

    return parseBrand(rows[0])
  } catch (error) {
    console.error('Error getting brand by name:', error)
    throw error
  }
}

/**
 * Get all brands (lite - for dropdown)
 */
export async function getAllBrands() {
  const pool = getPool()

  try {
    const query = `
      SELECT
        id,
        name,
        updated_at,
        color_primario
      FROM brands
      ORDER BY updated_at DESC
      LIMIT 100
    `

    const [rows] = await pool.execute(query)

    return rows.map(brand => ({
      id: brand.id,
      name: brand.name,
      updated_at: brand.updated_at,
      thumbnail: brand.color_primario || '#667eea'
    }))
  } catch (error) {
    console.error('Error getting all brands:', error)
    throw error
  }
}

/**
 * Update brand (con validación de usuario)
 * @param {number} id - Brand ID
 * @param {Object} updates - Campos a actualizar
 * @param {number} userId - User ID para validación
 */
export async function updateBrand(id, updates, userId) {
  const pool = getPool()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const {
      nombre,
      rubro,
      propuesta,
      color_primario,
      color_secundario,
      tipografia_principal,
      estilo_visual,
      data
    } = updates

    const query = `
      UPDATE brands SET
        name = COALESCE(?, name),
        rubro = COALESCE(?, rubro),
        propuesta = COALESCE(?, propuesta),
        color_primario = COALESCE(?, color_primario),
        color_secundario = COALESCE(?, color_secundario),
        tipografia_principal = COALESCE(?, tipografia_principal),
        estilo_visual = COALESCE(?, estilo_visual),
        data = COALESCE(?, data),
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `

    const [result] = await pool.execute(query, [
      nombre || null,
      rubro || null,
      propuesta || null,
      color_primario || null,
      color_secundario || null,
      tipografia_principal || null,
      estilo_visual || null,
      data ? JSON.stringify(data) : null,
      id,
      userId
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error('Error updating brand:', error)
    throw error
  }
}

/**
 * Delete brand (con validación de usuario)
 * @param {number} id - Brand ID
 * @param {number} userId - User ID para validación
 */
export async function deleteBrand(id, userId) {
  const pool = getPool()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Verificar que el brand pertenece al usuario
    const [checkRows] = await pool.execute(
      'SELECT id FROM brands WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (checkRows.length === 0) {
      throw new Error('Brand not found or unauthorized')
    }

    // Delete associated visual analysis
    await pool.execute('DELETE FROM visual_analysis WHERE brand_id = ?', [id])

    // Delete associated conversations
    await pool.execute('DELETE FROM conversations WHERE brand_id = ? AND user_id = ?', [id, userId])

    // Delete brand
    const query = 'DELETE FROM brands WHERE id = ? AND user_id = ?'
    const [result] = await pool.execute(query, [id, userId])

    return result.affectedRows > 0
  } catch (error) {
    console.error('Error deleting brand:', error)
    throw error
  }
}

/**
 * Save visual analysis for a brand
 */
export async function saveVisualAnalysis(brandId, analysis) {
  const pool = getPool()

  try {
    const query = `
      INSERT INTO visual_analysis (
        brand_id,
        detected_colors,
        detected_typography,
        detected_style,
        confidence_score,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        detected_colors = VALUES(detected_colors),
        detected_typography = VALUES(detected_typography),
        detected_style = VALUES(detected_style),
        confidence_score = VALUES(confidence_score)
    `

    const [result] = await pool.execute(query, [
      brandId,
      JSON.stringify(analysis.colors || []),
      JSON.stringify(analysis.typography || {}),
      JSON.stringify(analysis.style || {}),
      analysis.confidence || 75
    ])

    return result.insertId || result.affectedRows > 0
  } catch (error) {
    console.error('Error saving visual analysis:', error)
    throw error
  }
}

/**
 * Get visual analysis for a brand
 */
export async function getVisualAnalysis(brandId) {
  const pool = getPool()

  try {
    const query = `
      SELECT * FROM visual_analysis WHERE brand_id = ?
    `

    const [rows] = await pool.execute(query, [brandId])

    if (rows.length === 0) {
      return null
    }

    const analysis = rows[0]
    return {
      colors: JSON.parse(analysis.detected_colors || '[]'),
      typography: JSON.parse(analysis.detected_typography || '{}'),
      style: JSON.parse(analysis.detected_style || '{}'),
      confidence: analysis.confidence_score || 75
    }
  } catch (error) {
    console.error('Error getting visual analysis:', error)
    throw error
  }
}

/**
 * Parse brand from database format
 */
function parseBrand(dbBrand) {
  let data = {}

  // Parse JSON data field
  if (dbBrand.data) {
    try {
      data = typeof dbBrand.data === 'string' ? JSON.parse(dbBrand.data) : dbBrand.data
    } catch (e) {
      console.warn('Failed to parse brand data JSON')
    }
  }

  return {
    id: dbBrand.id,
    nombre: dbBrand.name,
    rubro: dbBrand.rubro || '',
    propuesta: dbBrand.propuesta || '',
    color_primario: dbBrand.color_primario || '#667eea',
    color_secundario: dbBrand.color_secundario || '#764ba2',
    tipografia_principal: dbBrand.tipografia_principal || 'Gotham',
    estilo_visual: dbBrand.estilo_visual || 'moderno',
    ...data, // Spread all additional data
    created_at: dbBrand.created_at,
    updated_at: dbBrand.updated_at
  }
}

/**
 * Initialize database schema (run once)
 */
export async function initializeDatabase() {
  const pool = getPool()

  try {
    // Create brands table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        rubro VARCHAR(100),
        propuesta TEXT,
        color_primario VARCHAR(7),
        color_secundario VARCHAR(7),
        tipografia_principal VARCHAR(100),
        estilo_visual VARCHAR(50),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_updated (updated_at)
      )
    `)

    // Create visual_analysis table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS visual_analysis (
        id INT PRIMARY KEY AUTO_INCREMENT,
        brand_id INT NOT NULL,
        detected_colors JSON,
        detected_typography JSON,
        detected_style JSON,
        confidence_score INT DEFAULT 75,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
        UNIQUE KEY unique_brand_analysis (brand_id)
      )
    `)

    console.log('✓ Database schema initialized')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
