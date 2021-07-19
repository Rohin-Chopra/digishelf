const axios = require('axios')
const { sequelize, Sequelize } = require('../config/db')
const AppError = require('../utils/AppError')
const errorHandler = require('../utils/errorHandler')
const Media = require('../models/media')(sequelize, Sequelize)

exports.handler = errorHandler(async (event) => {
  const data = JSON.parse(event.body)
  await sequelize.sync()

  // check if the shelf has that media, if not throw 404 otherwise just return the media
  const media = await Media.findOne({
    where: {
      id: event.pathParameters.mediaId,
      type: data.type
    }
  })

  if (media === null) {
    throw new AppError('Media not found', 404)
  }

  const res = await axios.get(
    `https://api.themoviedb.org/3/${data.type}/${event.pathParameters.mediaId}`,
    {
      params: {
        api_key: '4e02f274e1c605a2e0b08bac93f177e4'
      }
    }
  )

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    responseBody: { status: 'success', data: res.data }
  }
})
