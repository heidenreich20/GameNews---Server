require('dotenv').config()

module.exports = {
  schema:    './Models/News.js',
  out:       './db/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
}