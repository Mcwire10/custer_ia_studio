'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Redirigir al HTML estático
    window.location.href = '/studio-v2.html'
  }, [])

  return <div>Cargando...</div>
}
