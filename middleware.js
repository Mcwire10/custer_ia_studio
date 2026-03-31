/**
 * MIDDLEWARE - Proteger rutas de /app
 * Si no está autenticado, redirige a /login
 */

import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no necesitan autenticación
  const publicRoutes = ['/login', '/api/auth/login']

  // Si es ruta pública, dejar pasar
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Si es /app, verificar si tiene sesión
  if (pathname.startsWith('/app')) {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      // Sin sesión, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configurar qué rutas pasan por el middleware
export const config = {
  matcher: [
    // Proteger /app
    '/app/:path*',
    // Permitir acceso a APIs públicas
  ]
}
