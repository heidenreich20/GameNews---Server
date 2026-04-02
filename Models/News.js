const { eq, sql, desc, ilike } = require('drizzle-orm')
const { pgTable, uuid, text, varchar, timestamp, index } = require('drizzle-orm/pg-core')
const postgres = require('postgres')

// ── Schema ────────────────────────────────────────────────────────────────────

const news = pgTable(
  'news',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    text: text('text').notNull(),
    image: text('image').notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    author: varchar('author', { length: 255 }).notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    console: text('console').array().notNull().default(sql`'{}'::text[]`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index('news_category_idx').on(table.category),
    searchIdx: index('news_search_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.text})`
    ),
  })
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDb(app) {
  return app.locals.db
}

// ── Model ─────────────────────────────────────────────────────────────────────

const News = {
  schema: news,

  async create(app, data) {
    const [row] = await getDb(app).insert(news).values(data).returning()
    return row
  },

  async findById(app, id) {
    const [row] = await getDb(app).select().from(news).where(eq(news.id, id))
    return row ?? null
  },

  async findAll(app, { category, type, limit = 20, offset = 0 } = {}) {
    let query = getDb(app).select().from(news)
    if (category) query = query.where(ilike(news.category, category))
    if (type) query = query.where(eq(news.type, type))
    return query.orderBy(desc(news.createdAt)).limit(limit).offset(offset)
  },

  async search(app, term) {
    return getDb(app)
      .select()
      .from(news)
      .where(
        sql`to_tsvector('english', ${news.title} || ' ' || ${news.text})
            @@ plainto_tsquery('english', ${term})`
      )
      .orderBy(desc(news.createdAt))
  },

  async updateById(app, id, data) {
    const [row] = await getDb(app)
      .update(news)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning()
    return row ?? null
  },

  async deleteById(app, id) {
    const [row] = await getDb(app)
      .delete(news)
      .where(eq(news.id, id))
      .returning()
    return row ?? null
  },

  async count(app, { category } = {}) {
    const result = await getDb(app)
      .select({ count: sql`count(*)::int` })
      .from(news)
      .where(category ? ilike(news.category, category) : undefined)
    return result[0].count
  },
}

module.exports = { News, news }