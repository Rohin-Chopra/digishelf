const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)

exports.addShelve = async (event, context) => {
  let responseBody
  let statusCode

  try {
    const data = JSON.parse(event.body)
    await db.sequelize.sync()

    const shelf = await Shelf.create({
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      publicity: data.publicity,
      coverImg: data.coverImg
    })
    statusCode = 201
    responseBody = {
      status: 'success',
      data: {
        shelf
      }
    }
  } catch (error) {
    statusCode = 500
    responseBody = {
      status: 'error',
      message: error.message
    }
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    statusCode,
    body: responseBody
  }
}
