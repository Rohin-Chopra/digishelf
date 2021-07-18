const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)

const ShelfMedia = require('./../models/shelfMedia')(db.sequelize, db.Sequelize)

exports.deleteMediaFromShelf = async (event) => {
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

    // if the media has not been already added to shelf, throw an error
    const mediaShelf = await ShelfMedia.findOne({
      where: { MediaId: data.mediaId, ShelfId: shelf.id }
    })
    if (mediaShelf === null) {
      throw new Error('This item does not exist in this shelf')
    }

    await ShelfMedia.destroy({
      where: { MediaId: data.mediaId, ShelfId: shelf.id }
    })

    responseBody = {
      message: 'success, the item has been deleted from the shelf'
    }
    statusCode = 204
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
