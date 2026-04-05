const Joi = require('joi')

const newsSchema = Joi.object({
  title:    Joi.string().trim().min(1).max(255).required(),
  text:     Joi.string().min(1).required(),
  image:    Joi.string().uri().required(),
  category: Joi.string().max(100).required(),
  author:   Joi.string().max(255).required(),
  type:     Joi.string().max(100).required(),
  console:  Joi.array().items(Joi.string()).default([]),
})

function validateNews(req, res, next) {
  const { error, value } = newsSchema.validate(req.body, { abortEarly: false })
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