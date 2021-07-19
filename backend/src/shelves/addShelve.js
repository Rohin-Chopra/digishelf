const AppError = require('../utils/AppError')
const errorHandler = require('../utils/errorHandler')
const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)

// TODO :  add s3 image upload functionality
exports.addShelve = errorHandler(async (event, context) => {
  let shelf
  const data = JSON.parse(event.body)
  await db.sequelize.sync()

  try {
    shelf = await Shelf.create({
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      publicity: data.publicity,
      coverImg: data.coverImg
    })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError(
        'A shelf with this name exists already, try another name!',
        400
      )
    }
    throw new Error(error.message)
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    statusCode: 201,
    body: {
      status: 'success',
      data: { shelf }
    }
  }
})
