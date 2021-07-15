const db = require('../config/db')
const Media = require('./../models/media')(db.sequelize, db.Sequelize)

exports.addMedia = async (event) => {
  let statusCode, responseBody
  try {
    await db.sequelize.sync()

    const data = JSON.parse(event.body)
    const media = await Media.create({
      name: data.name,
      description: data.description,
      type: data.type,
      coverImg: data.coverImg
    })

    statusCode = 201
    responseBody = {
      status: 'success',
      data: { media }
    }
  } catch (error) {
    statusCode = 500
    responseBody = { message: error.message }
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
