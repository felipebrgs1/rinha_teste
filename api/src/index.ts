import { Hono } from 'hono'
import { serve } from 'bun'
import Redis from 'ioredis'

const app = new Hono()

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
})

app.get('/', (c) => c.json({ ok: true }))

app.get('/ping', async (c) => {
  const pong = await redis.ping()
  return c.json({ redis: pong })
})

app.get('/cache/:key', async (c) => {
  const key = c.req.param('key')
  const value = await redis.get(key)
  return c.json({ key, value })
})

app.post('/cache/:key', async (c) => {
  const key = c.req.param('key')
  const body = await c.req.json().catch(() => ({} as any))
  const value = body?.value ?? ''
  await redis.set(key, value)
  return c.json({ key, value })
})

const port = Number(process.env.PORT || 3000)

serve({
  fetch: app.fetch,
  port,
})

console.log(`API listening on :${port}`)
