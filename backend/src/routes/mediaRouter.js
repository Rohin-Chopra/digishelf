const { Router } = require('express')

const router = new Router()

const { getMedia } = require('./../controllers/media')

router.route('/:id').get(getMedia)

module.exports = router
