const db = require('../config/db')
const errorHandler = require('../utils/errorHandler')
const Shelf = require('../models/shelf')(db.sequelize, db.Sequelize)

exports.getMyShelves = errorHandler(async (event) => {
  await db.sequelize.sync()
  const shelves = await Shelf.findAll({
    where: {
      createdBy: event.requestContext.authorizer.claims.username
    }
  })

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: {
      results: shelves.length,
      status: 'success',
      data: { shelves }
    }
  }
})
