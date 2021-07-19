const { Op } = require('sequelize')
const db = require('../config/db')
const errorHandler = require('../utils/errorHandler')
const Shelf = require('../models/shelf')(db.sequelize, db.Sequelize)

exports.getAllShelves = errorHandler(async (event) => {
  await db.sequelize.sync()

  // Gets all public shelves and private shelf of the authed user
  const shelves = await Shelf.findAll({
    where: {
      [Op.or]: [
        { visibility: 'public' },
        { createdBy: event.requestContext.authorizer.claims.username }
      ]
    }
  })

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: {
      status: 'success',
      results: shelves.length,
      data: { shelves }
    }
  }
})
