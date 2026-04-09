/**
 * LIB/DB.JS - Conexión a MySQL
 * Simple y directo, sin ORM
 */

import mysql from 'mysql2/promise'

let pool

async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'custer_ia_studio',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
  }
  return pool
}

/**
 * Alias para getConnection (usado por brands-db.js y conversations-db.js)
 */
export async function getPool() {
  return await getConnection()
}

/**
 * Ejecutar query (SELECT, INSERT, UPDATE, DELETE)
 */
export async function query(sql, values) {
  try {
    const pool = await getConnection()
    const [results] = await pool.execute(sql, values || [])
    return results
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

/**
 * Obtener un registro
 */
export async function getOne(sql, values) {
  const results = await query(sql, values)
  return results[0] || null
}

/**
 * Obtener múltiples registros
 */
export async function getMany(sql, values) {
  return await query(sql, values)
}

/**
 * Insertar
 */
export async function insert(table, data) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(',')
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`
  const result = await query(sql, values)
  return result.insertId
}

/**
 * Actualizar
 */
export async function update(table, data, where) {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(',')
  const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ')
  const values = [...Object.values(data), ...Object.values(where)]
  const sql = `UPDATE ${table} SET ${sets} WHERE ${whereClause}`
  return await query(sql, values)
}

/**
 * Eliminar
 */
export async function deleteRecord(table, where) {
  const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ')
  const values = Object.values(where)
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`
  return await query(sql, values)
}

export default { query, getOne, getMany, insert, update, deleteRecord }
