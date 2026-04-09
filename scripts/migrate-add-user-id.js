/**
 * Script: Migración - Agregar user_id a tabla brands
 *
 * Ejecuta la migración para ligar brands a usuarios
 *
 * Uso: node scripts/migrate-add-user-id.js
 */

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

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

async function migrate() {
  const connection = await pool.getConnection()

  try {
    console.log('🔄 Ejecutando migración: Agregar user_id a brands...\n')

    // Leer archivo de migración
    const migrationPath = path.join(__dirname, '../docs/MIGRATION_ADD_USER_ID.sql')
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

    // Dividir statements
    const statements = migrationSql
      .split(';\n')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
      .map(stmt => stmt.trim() + ';')

    let executed = 0

    for (const statement of statements) {
      try {
        const result = await connection.execute(statement)
        console.log('✅', statement.substring(0, 70) + '...')
        executed++
      } catch (error) {
        // Errores ignorables
        if (
          error.code === 'ER_DUP_FIELDNAME' ||
          error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
          error.message.includes('already exists')
        ) {
          console.log('⚠️  Ya existe (ignorado)')
        } else {
          throw error
        }
      }
    }

    console.log(`\n✨ Migración completada (${executed} statements ejecutados)`)

    // Verificar cambios
    console.log('\n📋 Estructura de tabla brands después de migración:')
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
      AND TABLE_NAME = 'brands'
      AND COLUMN_NAME IN ('id', 'user_id', 'nombre', 'created_at')
    `)

    columns.forEach(col => {
      console.log(`  • ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}${col.IS_NULLABLE === 'NO' ? ' (NOT NULL)' : ''}`)
    })

  } catch (error) {
    console.error('❌ Error en migración:', error.message)
    process.exit(1)
  } finally {
    await connection.release()
    await pool.end()
  }
}

// Ejecutar
migrate().then(() => {
  console.log('\n✅ Migración completada exitosamente!')
  process.exit(0)
}).catch(error => {
  console.error('Error fatal:', error)
  process.exit(1)
})
