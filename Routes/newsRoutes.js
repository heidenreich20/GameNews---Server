const express        = require('express')
const router         = express.Router()
const rateLimit      = require('express-rate-limit')
const newsController = require('../Controllers/newsController')
const validateNews   = require('../Middleware/validateNews')
const auth           = require('../Middleware/auth')

// ── Rate limiters ─────────────────────────────────────────────────────────────

const baseLimiter = {
  windowMs:        60_000,
  message:         { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    (req) => req.ip,
}

const readLimiter  = rateLimit({ ...baseLimiter, max: 100 })
const writeLimiter = rateLimit({ ...baseLimiter, max: 10  })

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/',          readLimiter,  newsController.getNews)
router.get('/category',  readLimiter,  newsController.getNewsByCategory)
router.get('/:id',       readLimiter,  newsController.getNewsById)
router.post('/',         writeLimiter, auth, validateNews, newsController.createNews)
router.put('/:id',       writeLimiter, auth, validateNews, newsController.updateNews)
router.delete('/:id',    writeLimiter, auth,               newsController.deleteNews)

module.exports = router