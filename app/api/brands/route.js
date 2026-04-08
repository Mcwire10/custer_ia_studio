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
  updateBrand,
  deleteBrand,
  initializeDatabase
} from '@/lib/brands-db'

/**
 * GET /api/brands - List all brands
 * GET /api/brands?id=123 - Get specific brand
 */
export async function GET(request) {
  try {
    // Initialize DB on first request
    await initializeDatabase()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get specific brand
      const brand = await getBrand(parseInt(id))

      if (!brand) {
        return Response.json({ error: 'Brand not found' }, { status: 404 })
      }

      return Response.json({
        success: true,
        brand
      })
    }

    // Get all brands
    const brands = await getAllBrands()

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
 * POST /api/brands - Create new brand
 * Body:
 * {
 *   brand: { ...brand data },
 *   analysis?: { colors, typography, style }
 * }
 */
export async function POST(request) {
  try {
    const { brand, analysis } = await request.json()

    if (!brand || !brand.nombre) {
      return Response.json(
        { error: 'Brand name (nombre) is required' },
        { status: 400 }
      )
    }

    // Check if brand already exists
    const existing = await getBrandByName(brand.nombre)
    if (existing) {
      return Response.json(
        { error: 'Brand with this name already exists' },
        { status: 409 }
      )
    }

    // Save brand
    const result = await saveBrand(brand)

    return Response.json({
      success: true,
      id: result.id,
      brand: result,
      message: 'Brand created successfully'
    })
  } catch (error) {
    console.error('Error en POST /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/brands - Update brand
 * Body:
 * {
 *   id: 123,
 *   ...updates
 * }
 */
export async function PUT(request) {
  try {
    const { id, ...updates } = await request.json()

    if (!id) {
      return Response.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check if brand exists
    const brand = await getBrand(id)
    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Update brand
    const success = await updateBrand(id, updates)

    if (!success) {
      return Response.json({ error: 'Failed to update brand' }, { status: 400 })
    }

    const updated = await getBrand(id)

    return Response.json({
      success: true,
      brand: updated,
      message: 'Brand updated successfully'
    })
  } catch (error) {
    console.error('Error en PUT /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/brands/:id - Delete brand
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check if brand exists
    const brand = await getBrand(parseInt(id))
    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Delete brand
    const success = await deleteBrand(parseInt(id))

    if (!success) {
      return Response.json({ error: 'Failed to delete brand' }, { status: 400 })
    }

    return Response.json({
      success: true,
      message: 'Brand deleted successfully'
    })
  } catch (error) {
    console.error('Error en DELETE /api/brands:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
