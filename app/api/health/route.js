export async function GET() {
  const dbHost = process.env.DB_HOST
  const dbPort = process.env.DB_PORT
  const dbName = process.env.DB_NAME
  const dbUser = process.env.DB_USER

  // Test DNS resolution del host de BD
  let dnsOk = false
  let dnsError = null
  if (dbHost) {
    try {
      const dns = await import('dns/promises')
      await dns.lookup(dbHost)
      dnsOk = true
    } catch (e) {
      dnsError = e.message
    }
  }

  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    db: {
      host: dbHost || 'NOT SET',
      port: dbPort || 'NOT SET',
      name: dbName || 'NOT SET',
      user: dbUser || 'NOT SET',
      password: process.env.DB_PASSWORD ? '***' : 'NOT SET',
      dns_resolved: dnsOk,
      dns_error: dnsError
    },
    keys: {
      anthropic: process.env.ANTHROPIC_API_KEY ? '***SET***' : 'NOT SET',
      google: process.env.GOOGLE_API_KEY ? '***SET***' : 'NOT SET',
      openai: process.env.OPENAI_API_KEY ? '***SET***' : 'NOT SET'
    }
  })
}
