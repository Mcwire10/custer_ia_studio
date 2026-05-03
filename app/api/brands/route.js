/**
 * GET/POST /api/brands
 * GET /api/brands/:id
 * PUT/DELETE /api/brands/:id
 *
 * Brand CRUD operations with MySQL persistence
 */

import {
  saveBrand,
  getBrand,
  getBrandByName,
  getAllBrands,
  getBrandsByUser,
  updateBrand,
  deleteBrand,
  initializeDatabase
} from '@/lib/brands-db'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/brands - List all brands for authenticated user
 * GET /api/brands?id=123 - Get specific brand (must belong to user)
 */
export async function GET(request) {
  try {
    // Initialize DB on first request
    await initializeDatabase()

    // DEVELOPMENT BYPASS: permitir sin auth
    let user = await getCurrentUser()
    if (!user) {
      // Para desarrollo, usar user ID 1
      user = { id: 1, username: 'admin' }
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get specific brand - validate ownership
      const brand = await getBrand(parseInt(id), user.id)

      if (!brand) {
        return Response.json({ error: 'Brand no encontrado o acceso denegado' }, { status: 404 })
      }

      return Response.json({
        success: true,
        brand
      })
    }

    // Get all brands for this user
    const brands = await getBrandsByUser(user.id)

    return Response.json({
      success: true,
      brands
    })
  } catch (error) {
    console.error('Error en GET /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/brands - Create new brand for authenticated user
 * Body:
 * {
 *   brand: { ...brand data },
 *   analysis?: { colors, typography, style }
 * }
 */
export async function POST(request) {
  try {
    // Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { brand, analysis } = await request.json()

    if (!brand || !brand.nombre) {
      return Response.json(
        { error: 'Brand name (nombre) is required' },
        { status: 400 }
      )
    }

    // Save brand with user_id
    const result = await saveBrand(brand, user.id)

    return Response.json({
      success: true,
      id: result.id,
      brand: result,
      message: 'Marca creada exitosamente'
    })
  } catch (error) {
    console.error('Error en POST /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/brands - Update brand (must belong to authenticated user)
 * Body:
 * {
 *   id: 123,
 *   ...updates
 * }
 */
export async function PUT(request) {
  try {
    // Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { id, ...updates } = await request.json()

    if (!id) {
      return Response.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check if brand exists and belongs to user
    const brand = await getBrand(id, user.id)
    if (!brand) {
      return Response.json({ error: 'Brand no encontrado o acceso denegado' }, { status: 404 })
    }

    // Update brand
    const success = await updateBrand(id, updates, user.id)

    if (!success) {
      return Response.json({ error: 'Error actualizando la marca' }, { status: 400 })
    }

    const updated = await getBrand(id, user.id)

    return Response.json({
      success: true,
      brand: updated,
      message: 'Marca actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error en PUT /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/brands/:id - Delete brand (must belong to authenticated user)
 */
export async function DELETE(request) {
  try {
    // Validar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return Response.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check if brand exists and belongs to user
    const brand = await getBrand(parseInt(id), user.id)
    if (!brand) {
      return Response.json({ error: 'Brand no encontrado o acceso denegado' }, { status: 404 })
    }

    // Delete brand
    const success = await deleteBrand(parseInt(id), user.id)

    if (!success) {
      return Response.json({ error: 'Error eliminando la marca' }, { status: 400 })
    }

    return Response.json({
      success: true,
      message: 'Marca eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error en DELETE /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
