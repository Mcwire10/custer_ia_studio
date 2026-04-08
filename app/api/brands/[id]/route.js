/**
 * GET /api/brands/[id]
 * PUT /api/brands/[id]
 * DELETE /api/brands/[id]
 *
 * Individual brand operations
 */

import {
  getBrand,
  updateBrand,
  deleteBrand,
  getVisualAnalysis,
  initializeDatabase
} from '@/lib/brands-db'

/**
 * GET /api/brands/[id] - Get brand with all data
 */
export async function GET(request, { params }) {
  try {
    await initializeDatabase()

    const { id } = params

    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid brand ID' }, { status: 400 })
    }

    const brand = await getBrand(parseInt(id))

    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Get visual analysis if exists
    const analysis = await getVisualAnalysis(parseInt(id))

    return Response.json({
      success: true,
      brand: {
        ...brand,
        visualAssets: {
          ...(brand.visualAssets || {}),
          analysis: analysis || {}
        }
      }
    })
  } catch (error) {
    console.error('Error en GET /api/brands/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/brands/[id] - Update brand
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updates = await request.json()

    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid brand ID' }, { status: 400 })
    }

    const brand = await getBrand(parseInt(id))
    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    const success = await updateBrand(parseInt(id), updates)

    if (!success) {
      return Response.json({ error: 'Failed to update brand' }, { status: 400 })
    }

    const updated = await getBrand(parseInt(id))

    return Response.json({
      success: true,
      brand: updated,
      message: 'Brand updated successfully'
    })
  } catch (error) {
    console.error('Error en PUT /api/brands/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/brands/[id] - Delete brand
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id || isNaN(parseInt(id))) {
      return Response.json({ error: 'Invalid brand ID' }, { status: 400 })
    }

    const brand = await getBrand(parseInt(id))
    if (!brand) {
      return Response.json({ error: 'Brand not found' }, { status: 404 })
    }

    const success = await deleteBrand(parseInt(id))

    if (!success) {
      return Response.json({ error: 'Failed to delete brand' }, { status: 400 })
    }

    return Response.json({
      success: true,
      message: 'Brand deleted successfully'
    })
  } catch (error) {
    console.error('Error en DELETE /api/brands/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
