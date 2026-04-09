import { routes, type VercelConfig } from '@vercel/config/v1'

/**
 * Custer AI Studio - Vercel Configuration
 * Next.js 16 + MySQL + Claude AI Integration
 */
export const config: VercelConfig = {
  // Build Configuration
  buildCommand: 'npm run build',
  framework: 'nextjs',
  nodeVersion: '24.x',

  // Environment Variables (will be set via vercel env)
  env: [
    // API Keys
    'ANTHROPIC_API_KEY',
    'FAL_API_KEY',
    'STABILITY_API_KEY',
    'GEMINI_API_KEY',
    'REPLICATE_API_KEY',

    // Database
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',

    // App
    'NODE_ENV',
  ],

  // Functions (API Routes)
  functions: {
    // Increase timeout for AI generation endpoints
    'app/api/generate/**': {
      maxDuration: 60,
      memory: 1024,
    },
    'app/api/auto-populate-brand/**': {
      maxDuration: 30,
      memory: 512,
    },
    // Default timeout for other endpoints
    'app/api/**': {
      maxDuration: 10,
      memory: 256,
    },
  },

  // Crons (Optional - for background tasks)
  crons: [
    // Daily cleanup at 2 AM UTC
    {
      path: '/api/cleanup',
      schedule: '0 2 * * *',
    },
  ],

  // Headers
  headers: [
    // Cache static assets for 1 week
    {
      source: '/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=604800, immutable',
        },
      ],
    },
    // Security headers
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],

  // Redirects
  redirects: [
    // Redirect www to non-www
    {
      source: '/docs/:path*',
      destination: 'https://docs.custer.ai/:path*',
      permanent: true,
    },
  ],

  // Rewrites (if needed)
  rewrites: [],

  // Ignore patterns
  ignoreCommand: 'git diff --quiet HEAD^ HEAD -- . || exit 0',
}
