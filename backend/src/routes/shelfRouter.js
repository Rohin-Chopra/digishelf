const { Router } = require('express')

const router = new Router()

const {
  getShelf,
  getAllShelves,
  addShelf,
  editShelf,
  deleteShelf,
  addMediaToShelf,
  deleteMediaFromShelf
} = require('./../controllers/shelf')

router.route('/').get(getAllShelves).post(addShelf)

router.route('/:slug').get(getShelf).put(editShelf).delete(deleteShelf)

router.route('/:slug/media').post(addMediaToShelf)

router.route('/:slug/media/:mediaId').delete(deleteMediaFromShelf)

module.exports = router
