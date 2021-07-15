const db = require('../config/db')
const Shelf = require('../models/shelf')(db.sequelize, db.Sequelize)

exports.getShelf = async (event) => {
  let responseBody, statusCode

  try {
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
      statusCode = 404
      responseBody = {
        status: 'error',
        message: 'Could not find a shelf with this slug'
      }
    } else {
      statusCode = 200
      responseBody = { status: 'success', shelf }
    }
  } catch (error) {
    statusCode = 500
    responseBody = { error: error.message }
  }

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode,
    body: responseBody
  }
}
