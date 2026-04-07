const express = require('express')
const postgres = require('postgres')
const { drizzle } = require('drizzle-orm/postgres-js')
const cors = require('cors')
const helmet = require('helmet')
const { runMigrations } = require('./db/migrate')
require('dotenv').config()

const newsRoutes = require('./Routes/newsRoutes')
const uploadRoutes = require('./Routes/uploadRoutes')

const app = express()
app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({
  origin: [
    'https://game-news-liard.vercel.app',
    'https://next-game-news.vercel.app',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}))

app.use(express.json({ limit: '1mb' }))

app.use('/news', newsRoutes)

app.use('/upload', uploadRoutes)

app.get('/health', async (_, res) => {
  try {
    await app.locals.sql`SELECT 1`
    res.json({ status: 'ok' })
  } catch {
    res.status(503).json({ status: 'error', error: 'Database unreachable' })
  }
})

app.use((_, res) => res.status(404).json({ error: 'Route not found' }))

app.use((err, req, res, next) => {
  const code = err.code ?? err.cause?.code

  if (code === '22P02') {
    return res.status(400).json({ error: 'Invalid article ID' })
  }

  const status = err.status ?? 500
  const message = status < 500 ? (err.message ?? 'Bad request') : 'Internal server error'

  if (status >= 500) console.error(err)
  res.status(status).json({ error: message })
})

if (require.main === module) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined')
    process.exit(1)
  }

  const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: () => {}, 
  family: 4, 
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : 'require',
})

  const db = drizzle(sql)

  // ── Graceful shutdown ────────────────────────────────────────────────────────

  let server

  async function shutdown(signal) {
    console.log(`${signal} received, shutting down...`)
    server.close(async () => {
      try {
        await sql.end()
        console.log('Database connection closed')
        process.exit(0)
      } catch (err) {
        console.error('Error during shutdown:', err)
        process.exit(1)
      }
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  // ── Startup ──────────────────────────────────────────────────────────────────

  sql`SELECT 1`
    .then(async () => {
      app.locals.db = db
      app.locals.sql = sql

      await runMigrations(sql)

      const port = process.env.PORT || 3000
      server = app.listen(port, () => {
        console.log('Connected to database')
        console.log(`Server running on port ${port}`)
      })
    })
    .catch(err => {
      console.error('Database connection failed:', err)
      process.exit(1)
    })
}

module.exports = app