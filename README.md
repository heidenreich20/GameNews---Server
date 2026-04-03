# GameNewsServer

RESTful API for the Game News platform, built with Node.js, Express, and PostgreSQL. Fully containerized with Docker and deployed on Render.

## Stack

- **Runtime**: Node.js 22
- **Framework**: Express 4
- **Database**: PostgreSQL 16 (via Drizzle ORM + postgres.js)
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit, API key auth
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest + Supertest
- **Hosting**: Render (API + PostgreSQL)

## Project Structure

```
GameNewsServer/
├── Controllers/
│   └── newsController.js     # Request handlers
├── Middleware/
│   ├── auth.js               # API key authentication
│   └── validateNews.js       # Joi request validation
├── Models/
│   └── News.js               # Drizzle schema + query methods
├── Routes/
│   └── newsRoutes.js         # Express router
├── db/
│   ├── migrate.js            # Creates tables and indexes (runs on startup)
│   └── seed.js               # Seeds initial data
├── tests/
│   └── news.test.js          # Integration test suite
├── .dockerignore
├── .env
├── docker-compose.yml
├── Dockerfile
├── package.json
└── server.js                 # App entry point
```

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js >= 22

### 1. Clone and install

```bash
git clone https://github.com/your-username/game-news-server.git
cd GameNewsServer
npm install
```

### 2. Configure environment

Create a `.env` file at the root:

```env
DATABASE_URL=postgresql://game_news:secret@localhost:5435/game_news_db
TEST_DATABASE_URL=postgresql://game_news:secret@localhost:5435/game_news_db
ADMIN_API_KEY=your_secret_key
DATABASE_SSL=false
PORT=3000
```

> `DATABASE_SSL=false` disables SSL for local Docker connections.
> Set it to `true` when connecting to a remote database like Render.

### 3. Start the database

```bash
docker compose up -d db
```

### 4. Run migrations

```bash
npm run db:migrate
```

Migrations also run automatically every time the server starts.

### 5. Seed initial data (optional)

```bash
npm run db:seed
```

### 6. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## API Reference

### Authentication

Write endpoints require an `x-api-key` header:

```
x-api-key: your_secret_key
```

### Endpoints

#### `GET /news`

Returns paginated news articles.

**Query parameters:**

| Parameter | Type   | Default | Description       |
|-----------|--------|---------|-------------------|
| `page`    | number | `1`     | Page number       |
| `limit`   | number | `10`    | Articles per page |

**Response:**

```json
{
  "newsList": [...],
  "totalNewsCount": 12,
  "currentPage": 1,
  "totalPages": 2,
  "hasNextPage": true
}
```

---

#### `GET /news/category`

Returns articles filtered by category (case-insensitive).

**Query parameters:**

| Parameter  | Type   | Default | Description                      |
|------------|--------|---------|----------------------------------|
| `category` | string | —       | Category name (case-insensitive) |
| `limit`    | number | `10`    | Max articles to return           |

**Response:**

```json
{
  "newsList": [...],
  "categoryCount": 2,
  "totalNewsCount": 12,
  "error": null
}
```

---

#### `GET /news/:id`

Returns a single article by UUID.

**Response:**

```json
{
  "article": {
    "id": "uuid",
    "title": "...",
    "text": "...",
    "image": "https://...",
    "category": "RPG",
    "author": "...",
    "type": "Análisis",
    "console": ["PlayStation", "Xbox", "PC"],
    "created_at": "2023-03-06T06:38:42.940Z",
    "updated_at": "2023-03-06T06:38:42.940Z"
  }
}
```

**Error responses:**

| Status | Reason            |
|--------|-------------------|
| `400`  | Malformed UUID    |
| `404`  | Article not found |

---

#### `POST /news`

Creates a new article. Requires authentication.

**Headers:**

```
x-api-key: your_secret_key
Content-Type: application/json
```

**Request body:**

```json
{
  "title": "Article title",
  "text": "Article body text",
  "image": "https://example.com/image.jpg",
  "category": "RPG",
  "author": "Author Name",
  "type": "Noticia",
  "console": ["PlayStation", "Xbox", "PC"]
}
```

**Response `201`:**

```json
{
  "message": "Upload successful",
  "article": { ... }
}
```

---

#### `GET /health`

Returns API and database status. Used by Render for health checks.

```json
{ "status": "ok" }
```

---

## Rate Limiting

| Route        | Limit         |
|--------------|---------------|
| `GET` routes | 100 req / min |
| `POST /news` | 10 req / min  |

---

## Running Tests

Make sure the database is running before testing:

```bash
docker compose up -d db
npm test
```

Tests connect to the same database as development and truncate tables between each test for isolation.

---

## Docker

### Development (database only)

```bash
docker compose up -d db
npm run dev
```

### Full stack (API + database)

```bash
docker compose up -d
```

The API container connects to the database using the internal Docker service name `db` — handled automatically by Docker Compose networking.

### Port mapping

| Service  | Internal port | External port |
|----------|---------------|---------------|
| API      | 3000          | 3000          |
| Database | 5432          | 5435          |

Port 5435 is used externally to avoid conflicts with other local PostgreSQL instances.

---

## Deployment

### Environment variables

| Variable        | Description                                       |
|-----------------|---------------------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string                      |
| `DATABASE_SSL`  | Set to `true` for remote databases (Render, etc.) |
| `ADMIN_API_KEY` | Secret key for write endpoints                    |
| `PORT`          | Server port (default: `3000`)                     |

> Migrations run automatically on every server startup via `runMigrations()` in `server.js` — no manual migration step needed after deploying.

---

### Render (current production)

The API and database are both hosted on Render.

**Database setup:**
1. Create a **PostgreSQL** database on Render
2. Copy the **Internal Database URL** for use by the API service
3. Copy the **External Database URL** for running seeds locally

**API setup:**
1. Create a **Web Service** on Render
2. Connect your GitHub repo
3. Set **Environment** to `Docker`
4. Set the following environment variables:

```env
DATABASE_URL=        # Internal Database URL from Render
DATABASE_SSL=true
ADMIN_API_KEY=       # Your secret key
PORT=3000
```

5. Deploy — Render builds from the `Dockerfile` automatically

**Seeding the production database from your local machine:**

```bash
# Temporarily set your .env to the External Database URL
DATABASE_URL=postgresql://user:password@host.render.com/dbname
DATABASE_SSL=true

npm run db:seed

# Restore local values afterward
DATABASE_URL=postgresql://game_news:secret@localhost:5435/game_news_db
DATABASE_SSL=false
```

> Render requires SSL for all connections. `DATABASE_SSL=true` enables
> `{ rejectUnauthorized: false }` on the postgres client, which is required
> for Render's managed certificates.

---

### Railway

1. Create a **PostgreSQL** service on Railway
2. Create a new service and connect your GitHub repo
3. Set environment variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true
ADMIN_API_KEY=your_secret_key
```

4. Deploy — Railway detects the `Dockerfile` automatically

---

### VPS

```bash
git clone https://github.com/your-username/game-news-server.git
cd GameNewsServer
cp .env.example .env   # fill in production values
docker compose up -d
```

Migrations run on startup — no separate migration step needed.

---

## Scripts

| Script                | Description                        |
|-----------------------|------------------------------------|
| `npm start`           | Start the server                   |
| `npm run dev`         | Start with nodemon (auto-reload)   |
| `npm test`            | Run the test suite                 |
| `npm run db:migrate`  | Create tables and indexes manually |
| `npm run db:seed`     | Insert initial data                |
| `npm run db:generate` | Generate Drizzle migration files   |
| `npm run db:push`     | Apply generated Drizzle migrations |
