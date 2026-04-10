/**
 * POST /api/setup
 * Inicializa la BD: crea tablas y usuario demo
 * SOLO PARA DESARROLLO
 */

import { query } from '@/lib/db'
import { createUser } from '@/lib/auth'

export async function POST() {
  const results = []

  try {
    // 1. Crear tabla users con password_hash (bcrypt)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    results.push('✓ Table: users')

    // 2. Crear tabla logs
    await query(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        details JSON,
        result VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    results.push('✓ Table: logs')

    // 3. Crear tabla brands con user_id
    await query(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    results.push('✓ Table: brands')

    // 4. Crear tabla conversations
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        brand_id INT,
        messages JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    results.push('✓ Table: conversations')

    // 5. Crear usuario demo con bcrypt
    try {
      const demoUser = await createUser('demo', '1234', 'demo@custer.ai')
      results.push(`✓ User: demo (id=${demoUser.id})`)
    } catch (e) {
      if (e.message?.includes('Duplicate') || e.code === 'ER_DUP_ENTRY') {
        results.push('✓ User: demo (ya existe)')
      } else {
        results.push(`⚠️ User demo error: ${e.message}`)
      }
    }

    return Response.json({
      success: true,
      message: 'Database initialized',
      results
    })

  } catch (error) {
    console.error('Setup error:', error)
    return Response.json(
      { error: error.message, results },
      { status: 500 }
    )
  }
}
