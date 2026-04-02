# GameNewsServer

RESTful API for the Game News platform, built with Node.js, Express, and PostgreSQL.

## Stack

- **Runtime**: Node.js 24
- **Framework**: Express 4
- **Database**: PostgreSQL 16 (via Drizzle ORM + postgres.js)
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit, API key auth
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest + Supertest

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
│   ├── migrate.js            # Creates tables and indexes
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

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://game_news:secret@localhost:5435/game_news_db
TEST_DATABASE_URL=postgresql://game_news:secret@localhost:5435/game_news_db
ADMIN_API_KEY=your_secret_key
PORT=3000
```

### 3. Start the database

```bash
docker compose up -d db
```

### 4. Run migrations

```bash
npm run db:migrate
```

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

| Parameter | Type   | Default | Description          |
|-----------|--------|---------|----------------------|
| `page`    | number | `1`     | Page number          |
| `limit`   | number | `10`    | Articles per page    |

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

Returns articles filtered by category.

**Query parameters:**

| Parameter  | Type   | Default | Description                        |
|------------|--------|---------|------------------------------------|
| `category` | string | —       | Category name (case-insensitive)   |
| `limit`    | number | `10`    | Max articles to return             |

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

| Status | Reason                    |
|--------|---------------------------|
| `400`  | Malformed UUID            |
| `404`  | Article not found         |

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

Returns the API and database status.

```json
{ "status": "ok" }
```

---

## Rate Limiting

| Route         | Limit           |
|---------------|-----------------|
| `GET` routes  | 100 req / min   |
| `POST /news`  | 10 req / min    |

---

## Running Tests

Make sure the database is running before testing:

```bash
docker compose up -d db
npm test
```

Tests use the same database as development, truncating tables between each test for isolation.

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

The API container connects to the database using the internal Docker hostname `db`.

---

## Deployment

### Environment variables in production

| Variable        | Description                        |
|-----------------|------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string       |
| `ADMIN_API_KEY` | Secret key for write endpoints     |
| `PORT`          | Server port (default: `3000`)      |

### Railway

1. Create a PostgreSQL service on Railway
2. Connect your GitHub repo as a new service
3. Set `DATABASE_URL` to `${{Postgres.DATABASE_URL}}`
4. Set `ADMIN_API_KEY` to your secret key
5. Deploy — Railway builds from the `Dockerfile` automatically

### Render

1. Create a PostgreSQL database on Render
2. Create a Web Service, select Docker environment
3. Set `DATABASE_URL` to the **Internal Database URL**
4. Set `ADMIN_API_KEY` to your secret key

### VPS

```bash
git clone https://github.com/your-username/game-news-server.git
cd GameNewsServer
cp .env.example .env   # fill in production values
docker compose up -d
npm run db:migrate
```

---

## Scripts

| Script            | Description                          |
|-------------------|--------------------------------------|
| `npm start`       | Start the server                     |
| `npm run dev`     | Start with nodemon (auto-reload)     |
| `npm test`        | Run the test suite                   |
| `npm run db:migrate` | Create tables and indexes         |
| `npm run db:seed` | Insert initial data                  |
