const AppError = require('../utils/AppError')
const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)
const errorHandler = require('./../utils/errorHandler')

exports.editShelf = errorHandler(async (event) => {
  await db.sequelize.sync()
  const shelf = await Shelf.findOne({
    where: { slug: event.pathParameters.slug }
  })
  if (
    shelf === null ||
    shelf.createdBy !== event.requestContext.authorizer.claims.username
  ) {
    throw new AppError(
      'Unable to edit, shelf with the given id was not found',
      400
    )
  }

  await Shelf.update(
    {
      name: event.body.name,
      description: event.body.description,
      visibility: event.body.visibility,
      coverImg: event.body.coverImg
    },
    {
      where: {
        slug: event.pathParameters.slug
      }
    }
  )

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: {
      status: 'success',
      message: 'The shelf has been updated'
    }
  }
})
