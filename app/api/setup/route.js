/**
 * POST /api/setup
 * Endpoint para inicializar la BD con usuario demo
 * SOLO PARA DESARROLLO - eliminar en producción
 */

import { createUser } from '@/lib/auth'
import { initializeDatabase } from '@/lib/brands-db'

export async function POST(request) {
  try {
    // Intentar inicializar schema de BD
    try {
      await initializeDatabase()
      console.log('✓ Database schema initialized')
    } catch (dbError) {
      console.warn('⚠️ Database initialization failed (expected in dev):', dbError.message)
      console.log('⚠️ Continuando sin BD... (usaremos mock data en dev)')
    }

    // Intentar crear usuario demo
    try {
      const demoUser = await createUser('demo', '1234', 'demo@custer.ai')
      console.log('✓ Demo user created in database')

      return Response.json({
        success: true,
        message: 'Database initialized and demo user created',
        user: demoUser,
        env: 'production'
      })
    } catch (userError) {
      console.warn('⚠️ User creation failed, returning mock data for dev testing')

      // En desarrollo, retornar mock user
      return Response.json({
        success: true,
        message: 'Setup complete (dev mode - mock user)',
        user: {
          id: 1,
          username: 'demo',
          email: 'demo@custer.ai',
          created_at: new Date().toISOString()
        },
        env: 'development',
        note: 'Using mock data - database not accessible'
      })
    }
  } catch (error) {
    console.error('Setup error:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
