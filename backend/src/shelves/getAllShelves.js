const { Op } = require('sequelize')
const db = require('../config/db')
const Shelf = require('../models/shelf')(db.sequelize, db.Sequelize)

exports.getAllShelves = async (event) => {
  let responseBody, statusCode

  try {
    // const data = JSON.parse(event)
    await db.sequelize.sync({ force: false })

    // I want all public shelves and private repos of the user as well
    const shelves = await Shelf.findAll({
      where: {
        [Op.or]: [
          { visibility: 'public' },
          { createdBy: event.requestContext.authorizer.claims.username }
        ]
      }
    })
    statusCode = 200
    responseBody = {
      status: 'success',
      results: shelves.length,
      data: { shelves }
    }
  } catch (error) {
    statusCode = 500
    responseBody = { status: 'fail', message: error.message }
  }

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode,
    body: responseBody
  }
}
