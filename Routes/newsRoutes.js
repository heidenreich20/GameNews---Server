const express = require('express')
const router = express.Router()
const { rateLimit, ipKeyGenerator } = require('express-rate-limit')
const newsController = require('../Controllers/newsController')
const validateNews = require('../Middleware/validateNews')
const auth = require('../Middleware/auth')

// ── Rate limiters ─────────────────────────────────────────────────────────────

const baseLimiter = {
  windowMs: 60_000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
}

const isTest = process.env.NODE_ENV === 'test'

const readLimiter  = isTest ? (req, res, next) => next() : rateLimit({ ...baseLimiter, max: 100 })
const writeLimiter = isTest ? (req, res, next) => next() : rateLimit({ ...baseLimiter, max: 10  })

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/', readLimiter, newsController.getNews)
router.get('/:id', readLimiter, newsController.getNewsById)
router.post('/', writeLimiter, auth, validateNews, newsController.createNews)
router.put('/:id', writeLimiter, auth, validateNews, newsController.updateNews)
router.delete('/:id', writeLimiter, auth, newsController.deleteNews)

module.exports = router