const request = require('supertest')
const postgres = require('postgres')
const { drizzle } = require('drizzle-orm/postgres-js')
const app = require('../server')

const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL
const VALID_API_KEY = process.env.ADMIN_API_KEY ?? 'test-key'

const makeArticle = (overrides = {}) => ({
  title:    "Fallout New Vegasn't: A Satire",
  text:     'Exploring the Mojave that never was.',
  image:    'https://images.com/fnv.jpg',
  category: 'RPG',
  author:   'Pablo',
  type:     'Analysis',
  ...overrides,
})

let sql
let db
let sharedId

beforeAll(async () => {
  sql = postgres(TEST_DB_URL)
  db  = drizzle(sql)

  app.locals.sql = sql
  app.locals.db  = db

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
})

afterAll(async () => {
  await sql.end()
})

afterEach(async () => {
  await sql`TRUNCATE TABLE news RESTART IDENTITY`
})

async function seedMany(articles) {
  return sql`INSERT INTO news ${sql(articles)} RETURNING *`
}

describe('Gaming News API', () => {

  // ── POST /news ──────────────────────────────────────────────────────────

  describe('POST /news', () => {
    it('creates a valid article and returns 201', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())

      expect(res.statusCode).toBe(201)
      expect(res.body.article).toMatchObject({
        title:    "Fallout New Vegasn't: A Satire",
        category: 'RPG',
        author:   'Pablo',
      })
      expect(res.body.article.id).toBeDefined()
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send({ author: 'Pablo' })

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('returns 400 when image is not a valid URL', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle({ image: 'not-a-url' }))

      expect(res.statusCode).toBe(400)
    })

    it('returns 401 when API key is missing', async () => {
      const res = await request(app)
        .post('/news')
        .send(makeArticle())

      expect(res.statusCode).toBe(401)
    })

    it('returns 401 when API key is wrong', async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', 'wrong-key')
        .send(makeArticle())

      expect(res.statusCode).toBe(401)
    })
  })

  // ── GET /news ───────────────────────────────────────────────────────────

  describe('GET /news', () => {
    beforeEach(async () => {
      const articles = Array.from({ length: 15 }, (_, i) =>
        makeArticle({
          title:    `News Article ${i}`,
          category: i % 2 === 0 ? 'Action' : 'Indie',
          author:   'PaginationBot',
          type:     'News',
        })
      )
      await seedMany(articles)
    })

    it('returns paginated results with correct metadata', async () => {
      const res = await request(app).get('/news?page=1&limit=5')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(5)
      expect(res.body.totalNewsCount).toBe(15)
      expect(res.body.currentPage).toBe(1)
      expect(res.body.totalPages).toBe(3)
      expect(res.body.hasNextPage).toBe(true)
    })

    it('returns different items on page 2', async () => {
      const p1 = await request(app).get('/news?page=1&limit=5')
      const p2 = await request(app).get('/news?page=2&limit=5')

      const p1Ids = p1.body.newsList.map(n => n.id)
      const p2Ids = p2.body.newsList.map(n => n.id)

      expect(p2.body.currentPage).toBe(2)
      expect(p2Ids.some(id => p1Ids.includes(id))).toBe(false)
    })

    it('returns hasNextPage=false on the last page', async () => {
      const res = await request(app).get('/news?page=3&limit=5')

      expect(res.body.hasNextPage).toBe(false)
      expect(res.body.newsList).toHaveLength(5)
    })

    it('defaults to page 1 and limit 10 when params are omitted', async () => {
      const res = await request(app).get('/news')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList).toHaveLength(10)
      expect(res.body.currentPage).toBe(1)
    })

    it('filters by category', async () => {
      const res = await request(app).get('/news?category=Action&limit=20')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList.every(n => n.category === 'Action')).toBe(true)
    })

    it('is case-insensitive when filtering by category', async () => {
      const res = await request(app).get('/news?category=action&limit=20')

      expect(res.statusCode).toBe(200)
      expect(res.body.newsList.length).toBeGreaterThan(0)
    })

    it('returns 404 for a non-existent category', async () => {
      const res = await request(app).get('/news?category=Cooking')

      expect(res.statusCode).toBe(404)
      expect(res.body.error).toBe('Category not found')
    })
  })

  // ── GET /news/:id ───────────────────────────────────────────────────────

  describe('GET /news/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())
      sharedId = res.body.article.id
    })

    it('fetches an article by ID', async () => {
      const res = await request(app).get(`/news/${sharedId}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.article.title).toContain('Fallout')
      expect(res.body.article.id).toBe(sharedId)
    })

    it('returns 404 for a valid but non-existent ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res    = await request(app).get(`/news/${fakeId}`)

      expect(res.statusCode).toBe(404)
      expect(res.body.error).toBe('Article not found')
    })

    it('returns 400 for a malformed ID', async () => {
      const res = await request(app).get('/news/not-a-valid-id')

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Invalid article ID')
    })
  })

  // ── PUT /news/:id ───────────────────────────────────────────────────────

  describe('PUT /news/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())
      sharedId = res.body.article.id
    })

    it('updates an article and returns it', async () => {
      const res = await request(app)
        .put(`/news/${sharedId}`)
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle({ title: 'Updated Title' }))

      expect(res.statusCode).toBe(200)
      expect(res.body.article.title).toBe('Updated Title')
    })

    it('returns 404 for a non-existent ID', async () => {
      const res = await request(app)
        .put('/news/00000000-0000-0000-0000-000000000000')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())

      expect(res.statusCode).toBe(404)
    })

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .put(`/news/${sharedId}`)
        .send(makeArticle())

      expect(res.statusCode).toBe(401)
    })
  })

  // ── DELETE /news/:id ────────────────────────────────────────────────────

  describe('DELETE /news/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/news')
        .set('x-api-key', VALID_API_KEY)
        .send(makeArticle())
      sharedId = res.body.article.id
    })

    it('deletes an article and returns confirmation', async () => {
      const res = await request(app)
        .delete(`/news/${sharedId}`)
        .set('x-api-key', VALID_API_KEY)

      expect(res.statusCode).toBe(200)
      expect(res.body.message).toBe('Article deleted successfully')
    })

    it('returns 404 when fetching a deleted article', async () => {
      await request(app)
        .delete(`/news/${sharedId}`)
        .set('x-api-key', VALID_API_KEY)

      const res = await request(app).get(`/news/${sharedId}`)
      expect(res.statusCode).toBe(404)
    })

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .delete(`/news/${sharedId}`)

      expect(res.statusCode).toBe(401)
    })
  })

  // ── GET /health ─────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns status ok', async () => {
      const res = await request(app).get('/health')

      expect(res.statusCode).toBe(200)
      expect(res.body.status).toBe('ok')
    })
  })
})