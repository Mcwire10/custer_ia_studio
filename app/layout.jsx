import './globals.css'

export const metadata = {
  title: 'Custer IA — Studio',
  description: 'Gestión de marca, generación de contenido y análisis de comunicación',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
