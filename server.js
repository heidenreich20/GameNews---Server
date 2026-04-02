const express = require('express')
const postgres = require('postgres')
const { drizzle } = require('drizzle-orm/postgres-js')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const newsRoutes = require('./Routes/newsRoutes')

const app = express()

app.use(helmet())
app.use(cors({
  origin: [
    'https://game-news-liard.vercel.app',
    'https://next-game-news.vercel.app',
    'http://localhost:3000',
  ],
  methods:        ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}))

app.use(express.json({ limit: '1mb' }))

app.use('/news', newsRoutes)

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
  console.error(err)
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' })
})

if (require.main === module) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined')
    process.exit(1)
  }

  const sql = postgres(process.env.DATABASE_URL, {
    max:             10,
    idle_timeout:    30,
    connect_timeout: 10,
  })

  const db = drizzle(sql)

  // Verify the connection before starting the server
  sql`SELECT 1`
    .then(() => {
      // Attach db to app.locals so routes can access it
      app.locals.db = db
      app.locals.sql = sql

      const port = process.env.PORT || 3000
      app.listen(port, () => console.log(`Server running on port ${port}`))
      console.log('Connected to database')
    })
    .catch(err => {
      console.error('Database connection failed:', err)
      process.exit(1)
    })
}

module.exports = app