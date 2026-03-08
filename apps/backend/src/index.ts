import { auth } from '@/lib/auth'
import { errorHandler } from '@/lib/http'
import { logger } from '@/middleware/logger'
import v1Routes from '@/routes/v1'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', logger)

// CORS configuration - must be before routes
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8081',
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
]
app.use(
  '*',
  cors({
    origin: origin => {
      // Allow requests with no origin (mobile apps don't send Origin header)
      if (!origin) return '*'
      // Allow Expo and custom scheme origins
      if (origin.startsWith('exp://') || origin.startsWith('culynapp://')) {
        return origin
      }
      // Allow configured origins
      if (corsOrigins.includes(origin)) return origin
      // Allow all origins in development
      return process.env.NODE_ENV === 'development' ? origin : corsOrigins[0]
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    exposeHeaders: ['Content-Length', 'Set-Cookie'],
    credentials: true,
    maxAge: 600,
  })
)

app.onError(errorHandler)

app.on(['POST', 'GET'], '/auth/*', c => {
  return auth.handler(c.req.raw)
})

app.route('/v1', v1Routes)

app.get('/', c => {
  return c.json({
    name: 'Culyn API',
    version: '1.0.0',
    status: 'running',
  })
})

export default {
  port: 8000,
  fetch: app.fetch,
}
