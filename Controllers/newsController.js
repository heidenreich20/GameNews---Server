const { News } = require("../Models/News");

// ── Controllers ───────────────────────────────────────────────────────────────

exports.createNews = async (req, res) => {
  try {
    const article = await News.create(req.app, req.body);
    res.status(201).json({ message: "Upload successful", article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getNews = async (req, res) => {
  try {
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const [newsList, totalNewsCount] = await Promise.all([
      News.findAll(req.app, { limit, offset }),
      News.count(req.app),
    ]);

    res.json({
      newsList,
      totalNewsCount,
      currentPage: page,
      totalPages:  Math.ceil(totalNewsCount / limit),
      hasNextPage: page * limit < totalNewsCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getNewsByCategory = async (req, res) => {
  const limit        = parseInt(req.query.limit, 10) || 10;
  const { category } = req.query;

  try {
    const [newsList, totalNewsCount, categoryCount] = await Promise.all([
      News.findAll(req.app, { category, limit }),
      News.count(req.app),
      category ? News.count(req.app, { category }) : Promise.resolve(0),
    ]);

    res.json({
      newsList,
      categoryCount,
      totalNewsCount,
      error: (category && categoryCount === 0) ? "Category does not exist" : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const article = await News.findById(req.app, req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({ article });
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(400).json({ error: "Invalid article ID" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};