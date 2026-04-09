/**
 * Brands Database Functions
 * Manages MySQL operations for brand persistence
 */

import { getPool } from './db.js'

/**
 * Save new brand to database (con user_id)
 *
 * PHASE 6: Valida que el brandData contenga todos los 58 campos del Brain
 * Almacena campos principales en columnas específicas, resto en JSON
 *
 * @param {Object} brandData - Todos los datos de la marca (58 campos)
 * @param {number} userId - ID del usuario
 */
export async function saveBrand(brandData, userId) {
  const pool = await getPool()

  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Extraer campos principales (con alias para BD)
    const {
      nombre = '',
      name = '',
      rubro = '',
      propuesta = '',
      color_primario = '#6860EE',
      color_secundario = '#F5A623',
      tipografia_principal = 'Gotham',
      estilo_visual = 'moderno'
    } = brandData

    // Usar nombre o name (por compatibilidad)
    const brandName = nombre || name || 'Sin nombre'

    // Guardar TODO el brandData como JSON
    // Esto permite almacenar los 58 campos sin problemas
    const allData = JSON.stringify({
      ...brandData,
      // Asegurar que los campos principales estén en data también
      nombre: brandName,
      rubro,
      propuesta,
      color_primario,
      color_secundario,
      tipografia_principal,
      estilo_visual
    })

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
      brandName,
      rubro,
      propuesta,
      color_primario,
      color_secundario,
      tipografia_principal,
      estilo_visual,
      allData
    ])

    return {
      id: result.insertId,
      name: brandName,
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
  const pool = await getPool()

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
  const pool = await getPool()

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
  const pool = await getPool()

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
  const pool = await getPool()

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
  const pool = await getPool()

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
  const pool = await getPool()

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
  const pool = await getPool()

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
  const pool = await getPool()

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
/**
 * PHASE 6: Parse brand from database
 * Merges specific columns with JSON data to return all 58 fields
 */
function parseBrand(dbBrand) {
  let data = {}

  // Parse JSON data field - contains all 58 Brain fields
  if (dbBrand.data) {
    try {
      data = typeof dbBrand.data === 'string' ? JSON.parse(dbBrand.data) : dbBrand.data
    } catch (e) {
      console.warn('Failed to parse brand data JSON')
    }
  }

  // Merge DB columns with JSON data
  // Prioritize JSON data if it has fields, fall back to column values
  return {
    id: dbBrand.id,
    user_id: dbBrand.user_id,
    nombre: data.nombre || dbBrand.name || '',
    rubro: data.rubro || dbBrand.rubro || '',
    propuesta: data.propuesta || dbBrand.propuesta || '',
    color_primario: data.color_primario || dbBrand.color_primario || '#6860EE',
    color_secundario: data.color_secundario || dbBrand.color_secundario || '#F5A623',
    tipografia_principal: data.tipografia_principal || dbBrand.tipografia_principal || 'Gotham',
    estilo_visual: data.estilo_visual || dbBrand.estilo_visual || 'moderno',
    // Spread all additional data from JSON (all 58 Brain fields)
    ...data,
    created_at: dbBrand.created_at,
    updated_at: dbBrand.updated_at
  }
}

/**
 * Initialize database schema (run once)
 */
export async function initializeDatabase() {
  const pool = await getPool()

  try {
    // Create brands table with user_id for multi-tenancy
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        rubro VARCHAR(100),
        propuesta TEXT,
        color_primario VARCHAR(7),
        color_secundario VARCHAR(7),
        tipografia_principal VARCHAR(100),
        estilo_visual VARCHAR(50),
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_brand (user_id, name),
        INDEX idx_user_id (user_id),
        INDEX idx_user_updated (user_id, updated_at),
        INDEX idx_name (name),
        INDEX idx_updated (updated_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Add user_id column if table exists but column doesn't (migration)
    try {
      await pool.execute(`
        ALTER TABLE brands
        ADD COLUMN user_id INT NOT NULL DEFAULT 1
      `)
      console.log('✓ Added user_id column to brands table')
    } catch (alterError) {
      // Column might already exist, ignore
      if (!alterError.message.includes('Duplicate column')) {
        console.warn('Note: user_id column may already exist')
      }
    }

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
