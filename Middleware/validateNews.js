const Joi = require('joi')

const newsSchema = Joi.object({
  title:    Joi.string().trim().min(1).max(255).required(),
  text:     Joi.string().trim().min(1).max(50_000).required(),
  image:    Joi.string().uri().required(),
  category: Joi.string().trim().max(100).required(),
  author:   Joi.string().trim().max(255).required(),
  type:     Joi.string().trim().max(100).required(),
  console:  Joi.array().items(Joi.string()).default([]),
})

function validateNews(req, res, next) {
  const { error, value } = newsSchema.validate(req.body, {
    abortEarly:   false,
    stripUnknown: true,
  })

  if (error) {
    return res.status(400).json({
      error:   'Validation failed',
      details: error.details.map(d => d.message),
    })
  }

  req.body = value
  next()
}

module.exports = validateNews
module.exports.newsSchema = newsSchema