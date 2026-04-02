/**
 * GET /api/brands - Obtener todas las marcas
 * POST /api/brands - Crear nueva marca
 * PUT /api/brands - Actualizar marca existente
 */

// Simulamos una "base de datos" con localStorage en el servidor
// En producción, sería una BD real
const brands = new Map()

export async function GET(request) {
  try {
    return Response.json({
      success: true,
      brands: Array.from(brands.values())
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const brand = await request.json()

    if (!brand.nombre) {
      return Response.json(
        { error: 'Nombre de marca requerido' },
        { status: 400 }
      )
    }

    // Crear ID único basado en nombre
    const brandId = brand.nombre.toLowerCase().replace(/\s+/g, '-')

    // Agregar metadata
    const newBrand = {
      id: brandId,
      ...brand,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    brands.set(brandId, newBrand)

    return Response.json({
      success: true,
      brand: newBrand,
      message: 'Marca guardada correctamente'
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const brand = await request.json()

    if (!brand.id || !brand.nombre) {
      return Response.json(
        { error: 'ID y nombre de marca requeridos' },
        { status: 400 }
      )
    }

    if (!brands.has(brand.id)) {
      return Response.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar marca
    const existing = brands.get(brand.id)
    const updated = {
      ...existing,
      ...brand,
      updatedAt: new Date().toISOString()
    }

    brands.set(brand.id, updated)

    return Response.json({
      success: true,
      brand: updated,
      message: 'Marca actualizada correctamente'
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
