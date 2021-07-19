const AppError = require('../utils/AppError')
const errorHandler = require('../utils/errorHandler')
const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)

const ShelfMedia = require('./../models/shelfMedia')(db.sequelize, db.Sequelize)

exports.deleteMediaFromShelf = errorHandler(async (event) => {
  const data = JSON.parse(event.body)
  await db.sequelize.sync({ force: false })

  // find the shelf and if it does not exist, throw an error
  const shelf = await Shelf.findOne({
    where: { slug: event.pathParameters.slug }
  })
  if (shelf === null) {
    throw new AppError('The shelf with this slug does not exist')
  }

  // if the media has not been already added to shelf, throw an error
  const mediaShelf = await ShelfMedia.findOne({
    where: { MediaId: data.mediaId, ShelfId: shelf.id }
  })
  if (mediaShelf === null) {
    throw new AppError('This item does not exist in this shelf')
  }

  await ShelfMedia.destroy({
    where: { MediaId: data.mediaId, ShelfId: shelf.id }
  })

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 204,
    body: {
      status: 'success',
      message: 'The item has been deleted from the shelf'
    }
  }
})
