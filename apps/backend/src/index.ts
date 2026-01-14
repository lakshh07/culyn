import { auth } from '@/lib/auth'
import { errorHandler } from '@/lib/http'
import { logger } from '@/middleware/logger'
import v1Routes from '@/routes/v1'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', logger)
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
)

app.onError(errorHandler)

app.on(['POST', 'GET'], '/api/auth/*', c => {
  return auth.handler(c.req.raw)
})

app.route('/api/v1', v1Routes)

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
