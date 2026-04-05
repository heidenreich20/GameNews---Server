const { News } = require('../Models/News')

// ── Controllers ───────────────────────────────────────────────────────────────

exports.createNews = async (req, res, next) => {
  try {
    const article = await News.create(req.app, req.body)
    res.status(201).json({ message: 'Upload successful', article })
  } catch (err) {
    next(err)
  }
}

exports.getNews = async (req, res, next) => {
  try {
    const { category, type } = req.query
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    const filters = { category, type, limit, offset }

    const [newsList, totalNewsCount] = await Promise.all([
      News.findAll(req.app, filters),
      News.count(req.app, { category, type }),
    ])

    if (category && totalNewsCount === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({
      newsList,
      totalNewsCount,
      currentPage: page,
      totalPages: Math.ceil(totalNewsCount / limit),
      hasNextPage: page * limit < totalNewsCount,
    })
  } catch (err) {
    next(err)
  }
}

exports.getNewsById = async (req, res, next) => {
  try {
    const article = await News.findById(req.app, req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })
    res.json({ article })
  } catch (err) {
    next(err)
  }
}

exports.updateNews = async (req, res, next) => {
  try {
    const article = await News.updateById(req.app, req.params.id, req.body)
    if (!article) return res.status(404).json({ error: 'Article not found' })
    res.json({ message: 'Update successful', article })
  } catch (err) {
    next(err)
  }
}

exports.deleteNews = async (req, res, next) => {
  try {
    const article = await News.deleteById(req.app, req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })
    res.json({ message: 'Article deleted successfully' })
  } catch (err) {
    next(err)
  }
}