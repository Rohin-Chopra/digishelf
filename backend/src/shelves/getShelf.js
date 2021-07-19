const db = require('../config/db')
const AppError = require('../utils/AppError')
const errorHandler = require('../utils/errorHandler')
const Shelf = require('../models/shelf')(db.sequelize, db.Sequelize)

exports.getShelf = errorHandler(async (event) => {
  await db.sequelize.sync()

  const shelf = await Shelf.findOne({
    where: {
      ...event.body,
      slug: event.pathParameters.slug
    }
  })

  // check if the found shelf is private and the user is authorized to see it
  if (
    shelf === null ||
    (shelf.publicity === 'private' &&
      shelf.createdBy !== event.requestContext.authorizer.claims.username)
  ) {
    throw new AppError('Could not find a shelf with this slug', 404)
  }

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: { status: 'success', shelf }
  }
})
