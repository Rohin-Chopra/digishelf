const axios = require('axios')
const { models } = require('../config/db')
const { Media } = models
const AppError = require('../utils/AppError')
const asyncHandler = require('express-async-handler')

exports.getMedia = asyncHandler(async (req, res, next) => {
  await models.Media.sync()

  // check if the shelf has that media, if not throw 404 otherwise just return the media
  const media = await Media.findOne({
    where: {
      id: req.params.id,
      type: req.query.type
    }
  })

  if (media === null) {
    return next(new AppError('Media not found', 404))
  }

  const result = await axios.get(
    `https://api.themoviedb.org/3/${req.query.type}/${req.params.id}`,
    {
      params: {
        api_key: process.env.MOVIEDB_API_KEY
      }
    }
  )

  res.status(200).json({
    status: 'success',
    data: result.data
  })
})
