require('dotenv').config()
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL)

async function migrate() {
  console.log('Running migrations...')

  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(255)  NOT NULL,
      text        TEXT          NOT NULL,
      image       TEXT          NOT NULL,
      category    VARCHAR(100)  NOT NULL,
      author      VARCHAR(255)  NOT NULL,
      type        VARCHAR(100)  NOT NULL,
      console     TEXT[]        NOT NULL DEFAULT '{}',
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS news_category_idx ON news (category)
  `

  await sql`
    CREATE INDEX IF NOT EXISTS news_search_idx ON news
    USING GIN (to_tsvector('english', title || ' ' || text))
  `

  console.log('Migrations complete.')
  await sql.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})