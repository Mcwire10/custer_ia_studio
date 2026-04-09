/**
 * Script: Inicializar schema de conversaciones
 *
 * Crea las tablas necesarias para el sistema de conversaciones:
 * - conversations
 * - conversation_summaries
 * - conversation_context
 * - conversation_insights
 *
 * Uso: node scripts/init-conversations-schema.js
 */

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Cargar .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
})

async function initSchema() {
  const connection = await pool.getConnection()

  try {
    console.log('📦 Inicializando schema de conversaciones...\n')

    // Leer archivo SQL
    const schemaPath = path.join(__dirname, '../docs/CONVERSATIONS_SCHEMA.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8')

    // Dividir por líneas vacías o comentarios para ejecutar statements individuales
    const statements = schemaSql
      .split(';\n')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
      .map(stmt => stmt.trim() + ';')

    let created = 0

    for (const statement of statements) {
      try {
        await connection.execute(statement)
        console.log('✅', statement.substring(0, 60) + '...')
        created++
      } catch (error) {
        // Ignorar errores de "table already exists"
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Tabla ya existe (ignorado)')
        } else {
          console.error('❌ Error:', error.message)
        }
      }
    }

    console.log(`\n✨ Schema inicializado correctamente (${created} statements ejecutados)`)

    // Verificar tablas creadas
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND TABLE_NAME IN ('conversations', 'conversation_summaries', 'conversation_context', 'conversation_insights')
    `)

    console.log('\n📋 Tablas verificadas:')
    tables.forEach(table => {
      console.log(`  ✓ ${table.TABLE_NAME}`)
    })

  } catch (error) {
    console.error('❌ Error fatal:', error.message)
    process.exit(1)
  } finally {
    await connection.release()
    await pool.end()
  }
}

// Ejecutar
initSchema().then(() => {
  console.log('\n✅ Completado!')
  process.exit(0)
}).catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
