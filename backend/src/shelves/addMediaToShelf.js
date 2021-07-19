const AppError = require('../utils/AppError')
const errorHandler = require('../utils/errorHandler')
const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)
const Media = require('./../models/media')(db.sequelize, db.Sequelize)

const ShelfMedia = require('./../models/shelfMedia')(db.sequelize, db.Sequelize)

exports.addMediaToShelf = errorHandler(async (event) => {
  const data = JSON.parse(event.body)
  await db.sequelize.sync({ force: false })

  // find the shelf and if it does not exist, throw an error
  const shelf = await Shelf.findOne({
    where: { slug: event.pathParameters.slug }
  })
  if (shelf === null) {
    throw new AppError('The shelf with this slug does not exist', 404)
  }

  // create or get the media
  await Media.findOrCreate({
    where: { id: data.mediaId, type: data.mediaType },
    defaults: {
      id: data.mediaId,
      type: data.mediaType
    }
  })

  // Create an media shelf, and if it already exists, throw an error
  const [, mediaShelfCreated] = await ShelfMedia.findOrCreate({
    where: { MediaId: data.mediaId, ShelfId: shelf.id },
    defaults: { MediaId: data.mediaId, ShelfId: shelf.id }
  })
  if (!mediaShelfCreated) {
    throw new AppError('This item has already been added to this shelf', 400)
  }

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 201,
    body: {
      status: 'success',
      message: 'The item has been added to the shelf'
    }
  }
})
