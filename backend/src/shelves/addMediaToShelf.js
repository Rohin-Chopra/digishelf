const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)
const Media = require('./../models/media')(db.sequelize, db.Sequelize)

const ShelfMedia = require('./../models/shelfMedia')(db.sequelize, db.Sequelize)

exports.addMediaToShelf = async (event) => {
  let statusCode, responseBody
  try {
    const data = JSON.parse(event.body)
    await db.sequelize.sync({ force: false })

    // find the shelf and if it does not exist, throw an error
    const shelf = await Shelf.findOne({
      where: { slug: event.pathParameters.slug }
    })
    if (shelf === null) {
      throw new Error('The shelf with this slug does not exist')
    }

    // create or get the media
    await Media.findOrCreate({
      where: { id: data.mediaId },
      defaults: {
        id: data.mediaId
      }
    })

    // Create an media shelf, and if it already exists, throw an error
    const [mediaShelf, mediaShelfCreated] = await ShelfMedia.findOrCreate({
      where: { MediaId: data.mediaId, ShelfId: shelf.id },
      defaults: { MediaId: data.mediaId, ShelfId: shelf.id }
    })
    if (!mediaShelfCreated) {
      throw new Error('This item has already been added to this shelf')
    }

    responseBody = { message: 'success, the item has been added to the shelf' }
  } catch (error) {
    console.log(error)
    statusCode = 400
    responseBody = { message: error.message }
  }

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode,
    responseBody
  }
}
