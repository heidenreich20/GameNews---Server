const express    = require('express')
const router     = express.Router()
const auth       = require('../Middleware/auth')
const upload     = require('../Middleware/upload')
const { uploadImage } = require('../Controllers/uploadController')

router.post('/', auth, upload.single('image'), uploadImage)

module.exports = router