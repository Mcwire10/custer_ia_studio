'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Página /app - Redirecciona a studio-v2.html (static HTML)
 *
 * Este componente:
 * 1. Verifica que el usuario esté autenticado
 * 2. Si no está autenticado, redirige a /login.html
 * 3. Si está autenticado, carga studio-v2.html en un iframe
 *
 * Esto mantiene compatibilidad con la arquitectura static HTML
 * mientras usa Next.js para autenticación
 */

export default function AppPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verificar que el usuario esté autenticado
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          // No autenticado → redirigir a login
          window.location.href = '/login.html'
          return
        }

        // Autenticado → cargar la app
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth verification error:', error)
        // En caso de error, redirigir a login
        window.location.href = '/login.html'
      }
    }

    verifyAuth()
  }, [])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0D0C1E 0%, #1A1830 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Custer AI Studio</div>
          <div style={{ fontSize: '14px', color: '#888' }}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Cargar studio-v2.html como contenido de la página
  return (
    <iframe
      src="/studio-v2.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0
      }}
      title="Custer AI Studio"
    />
  )
}
