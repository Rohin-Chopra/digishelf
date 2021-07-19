const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)
const ShelfMedia = require('./../models/shelfMedia')(db.sequelize, db.Sequelize)
const errorHandler = require('./../utils/errorHandler')
const AppError = require('../utils/AppError')

exports.deleteShelf = errorHandler(async (event) => {
  const data = JSON.parse(event.body)
  await db.sequelize.sync()

  // check if the shelf exists, and if not throw an error

  const shelf = await Shelf.findOne({
    where: { id: data.id }
  })
  if (
    shelf === null ||
    shelf.createdBy !== event.requestContext.authorizer.claims.username
  ) {
    throw new AppError(
      'Unable to delete, shelf with the given id was not found',
      400
    )
  }

  // delete the shelf media entries associated with the given shelf
  await ShelfMedia.destroy({
    where: {
      ShelfId: shelf.id
    }
  })

  // delete the shelf from the shelf table
  await Shelf.destroy({
    where: {
      id: shelf.id
    }
  })

  return {
    statusCode: 204,
    body: {
      status: 'success',
      message: 'success, your shelf has been deleted'
    }
  }
})
