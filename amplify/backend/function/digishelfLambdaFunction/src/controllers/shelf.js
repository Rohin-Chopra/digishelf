const AWS = require('aws-sdk')
const asyncHandler = require('express-async-handler')
const { models } = require('./../config/db')
const { Shelf, ShelfMedia, Media } = models
const AppError = require('./../utils/AppError')
const getAllUsers = require('./../utils/getAllUsers')


exports.getShelf = asyncHandler(async (req, res, next) => {
  const shelf = await Shelf.findOne({
    where: {
      ...req.body,
      id: req.params.id
    },
    include: [
      {
        model: Media,
        attributes: ['id', 'type'],
        through: {
          attributes: []
        }
      }
    ]
  })
  // check if the found shelf is private and the user is authorized to see it
  if (
    shelf === null ||
    (shelf.publicity === 'private' && shelf.createdBy !== req.username)
  ) {
    return next(new AppError('Could not find a shelf with this id', 404))
  }

  res.status(200).json({
    status: 'success',
    shelf
  })
})

exports.getAllShelves = asyncHandler(async (req, res, next) => {

  const users = await getAllUsers()
  // Gets all public shelves and private shelf of the authed user
  const shelves = await Shelf.findAll({
    where: {
      visibility: 'public'
    },
    include: [
      {
        model: Media,
        attributes: ['id', 'type'],
        through: {
          attributes: []
        }
      }
    ]
  })
  shelves.forEach((shelf) => {
    shelf.createdByName = ''
    users.forEach(user => {
      if (user.email == shelf.createdBy) {
        shelf.dataValues.createdByName = user.name
        return
      }
    })
  })

  res.status(200).json({
    status: 'success',
    results: shelves.length,
    data: { shelves }
  })
})
exports.getMyShelves = asyncHandler(async (req, res, next) => {
  // Gets all shelves of the authed user
  const shelves = await Shelf.findAll({
    where: {
      createdBy: req.username
    },
    include: [
      {
        model: Media,
        attributes: ['id', 'type'],
        through: {
          attributes: []
        }
      }
    ]
  })
  res.status(200).json({
    status: 'success',
    results: shelves.length,
    data: { shelves }
  })
})

exports.addShelf = asyncHandler(async (req, res, next) => {
  const { nanoid } = require('nanoid')

  let shelf
  shelf = await Shelf.findOne({
    where: { name: req.body.name, createdBy: req.username }
  })
  if (shelf !== null) {
    return next(
      new AppError(
        'A shelf with this name already exists, try another name!',
        400
      )
    )
  }
  AWS.config.update({ region: 'ap-southeast-2' })

  const s3 = new AWS.S3({ })
  const { base64 } = req.body.coverImg
  const base64Data = new Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  )
  const type = base64.split(';')[0].split('/')[1]

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `images/${nanoid()}-${req.body.coverImg.name}`,
    ContentEncoding: 'base64',
    ContentType: `image/${type}`, // required. Notice the back ticks
    Body: base64Data
  }
  const data = await s3.upload(params).promise()

  shelf = await Shelf.create({
    name: req.body.name,
    description: req.body.description,
    createdBy: req.username,
    visibility: req.body.visibility,
    coverImg: data.Key
  })

  res.status(201).json({
    status: 'success',
    data: { shelf }
  })
})

exports.editShelf = asyncHandler(async (req, res, next) => {
  const shelf = await Shelf.findOne({
    where: { id: req.params.id, createdBy: req.username }
  })
  if (shelf === null) {
    return next(
      new AppError('Unable to edit, shelf with the given id was not found', 404)
    )
  }

  await Shelf.update(
    {
      name: req.body.name,
      description: req.body.description,
      visibility: req.body.visibility,
      coverImg: req.body.coverImg
    },
    {
      where: {
        id: req.params.id
      }
    }
  )
  res.status(200).json({
    status: 'success',
    message: 'The shelf has been updated'
  })
})

exports.deleteShelf = asyncHandler(async (req, res, next) => {
  // check if the shelf exists, and if not throw an error

  const shelf = await Shelf.findOne({
    where: { id: req.params.id, createdBy: req.username }
  })
  if (shelf === null) {
    return next(
      new AppError(
        'Unable to delete, shelf with the given id was not found',
        400
      )
    )
  }

  // delete the shelf media entries associated with the given shelf
  await ShelfMedia.destroy({
    where: {
      ShelfId: shelf.id
    }
  })

  // delete the shelf from the shelf table
  await Shelf.destroy({
    where: {
      id: shelf.id
    }
  })
  res.status(204).json({
    status: 'success',
    message: 'success, your shelf has been deleted'
  })
})

exports.addMediaToShelf = asyncHandler(async (req, res, next) => {
  // find the shelf and if it does not exist, throw an error
  const shelf = await Shelf.findOne({
    where: { id: req.params.id, createdBy: req.username }
  })
  if (shelf === null) {
    next(new AppError('The shelf with this id does not exist', 404))
  }

  // create or get the media
  await Media.findOrCreate({
    where: { id: req.body.mediaId, type: req.body.mediaType },
    defaults: {
      id: req.body.mediaId,
      type: req.body.mediaType
    }
  })

  // Create an media shelf, and if it already exists, throw an error
  const [, mediaShelfCreated] = await ShelfMedia.findOrCreate({
    where: { MediaId: req.body.mediaId, ShelfId: shelf.id },
    defaults: { MediaId: req.body.mediaId, ShelfId: shelf.id }
  })
  if (!mediaShelfCreated) {
    return next(
      new AppError('This item has already been added to this shelf', 400)
    )
  }
  res.status(200).json({
    status: 'success',
    message: 'The item has been added to the shelf'
  })
})

exports.deleteMediaFromShelf = asyncHandler(async (req, res, next) => {
  // find the shelf and if it does not exist, throw an error
  const shelf = await Shelf.findOne({
    where: { id: req.params.id, createdBy: req.username }
  })
  if (shelf === null) {
    return next(new AppError('The shelf with this id does not exist', 404))
  }

  // if the media has not been already added to shelf, throw an error
  const mediaShelf = await ShelfMedia.findOne({
    where: { MediaId: req.params.mediaId, ShelfId: shelf.id }
  })
  if (mediaShelf === null) {
    return next(new AppError('This item does not exist in this shelf', 404))
  }

  await ShelfMedia.destroy({
    where: { MediaId: req.params.mediaId, ShelfId: shelf.id }
  })
  res.status(204).json({
    status: 'success',
    message: 'The item has been deleted from the shelf'
  })
})
