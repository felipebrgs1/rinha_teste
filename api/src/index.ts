import { Hono } from 'hono'
import { serve } from 'bun'
import Redis from 'ioredis'

const app = new Hono()

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})


app.get('/', (c) => c.json({ ok: true }))

// Health check endpoint para o HAProxy
app.get('/health', async (c) => {
  try {
    // Verifica se o Redis está disponível
    await redis.ping()
    return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Health check failed:', error)
    return c.json({ status: 'unhealthy', error: 'Redis connection failed' }, 503)
  }
})

app.get('/ping', async (c) => {
  try {
    const pong = await redis.ping()
    return c.json({ redis: pong })
  } catch (error) {
    console.error('Redis ping failed:', error)
    return c.json({ error: 'Redis connection failed' }, 503)
  }
})

app.get('/cache/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const value = await redis.get(key)
    return c.json({ key, value })
  } catch (error) {
    console.error('Redis get failed:', error)
    return c.json({ error: 'Redis operation failed' }, 503)
  }
})

app.post('/cache/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const body = await c.req.json().catch(() => ({} as any))
    const value = body?.value ?? ''
    await redis.set(key, value)
    return c.json({ key, value })
  } catch (error) {
    console.error('Redis set failed:', error)
    return c.json({ error: 'Redis operation failed' }, 503)
  }
})

const port = Number(process.env.PORT || 3000)

serve({
  fetch: app.fetch,
  port,
})

console.log(`API listening on :${port}`)
