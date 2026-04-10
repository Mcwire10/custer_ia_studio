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
        const response = await fetch('/api/auth/me')

        if (!response.ok) {
          window.location.href = '/login.html'
          return
        }

        // Autenticado → redirigir directo al HTML estático
        window.location.href = '/studio-v2.html'
      } catch (error) {
        window.location.href = '/login.html'
      }
    }

    verifyAuth()
  }, [])

  // Pantalla de carga mientras verifica y redirige
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
