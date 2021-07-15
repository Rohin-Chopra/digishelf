const db = require('../config/db')
const Shelf = require('../models/shelf')(db.sequelize, db.Sequelize)

exports.getMyShelves = async (event) => {
  let responseBody, statusCode

  try {
    // const data = JSON.parse(event)
    await db.sequelize.sync()
    const shelves = await Shelf.findAll({
      where: {
        createdBy: event.requestContext.authorizer.claims.username
      }
    })
    statusCode = 200
    responseBody = { shelves }
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
