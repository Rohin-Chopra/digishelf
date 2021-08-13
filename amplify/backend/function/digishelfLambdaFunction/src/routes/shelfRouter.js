const { Router } = require('express')

const router = new Router()

const {
  getShelf,
  getAllShelves,
  addShelf,
  editShelf,
  deleteShelf,
  addMediaToShelf,
  deleteMediaFromShelf,
  getMyShelves
} = require('./../controllers/shelf')

router.route('/').get(getAllShelves).post(addShelf)
router.route('/my-shelves').get(getMyShelves)

router.route('/:id').get(getShelf).put(editShelf).delete(deleteShelf)

router.route('/:id/media').post(addMediaToShelf)

router.route('/:id/media/:mediaId').delete(deleteMediaFromShelf)

module.exports = router
