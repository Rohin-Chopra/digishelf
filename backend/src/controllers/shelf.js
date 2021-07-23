const AWS = require('aws-sdk')
const asyncHandler = require('express-async-handler')
const db = require('./../config/db')
const Shelf = require('./../models/shelf')(db.sequelize, db.Sequelize)
const ShelfMedia = require('./../models/shelfMedia')(db.sequelize, db.Sequelize)
const Media = require('./../models/media')(db.sequelize, db.Sequelize)
const AppError = require('./../utils/AppError')

exports.getShelf = asyncHandler(async (req, res, next) => {
  await db.sequelize.sync()

  const shelf = await Shelf.findOne({
    where: {
      ...req.body,
      slug: req.params.slug
    }
  })

  // check if the found shelf is private and the user is authorized to see it
  if (
    shelf === null ||
    (shelf.publicity === 'private' && shelf.createdBy !== req.username)
  ) {
    throw new AppError('Could not find a shelf with this slug', 404)
  }

  res.status(200).json({
    status: 'success',
    shelf
  })
})

exports.getAllShelves = asyncHandler(async (req, res, next) => {
  const { Op } = require('sequelize')

  await db.sequelize.sync()

  // Gets all public shelves and private shelf of the authed user
  const shelves = await Shelf.findAll({
    where: {
      [Op.or]: [{ visibility: 'public' }, { createdBy: req.username }]
    }
  })
  res.status(200).json({
    status: 'success',
    results: shelves.length,
    data: { shelves }
  })
})

// TODO :  add s3 image upload functionality
exports.addShelf = asyncHandler(async (req, res, next) => {
  const { nanoid } = require('nanoid')

  await db.sequelize.sync()
  let shelf

  shelf = await Shelf.findOne({
    where: { name: req.body.name }
  })
  if (shelf !== null) {
    return next(
      new AppError(
        'A shelf with this name already exists, try another name!',
        400
      )
    )
  }

  const s3 = new AWS.S3()
  const fileContent = Buffer.from(req.files.coverImg.data, 'binary')
  const params = {
    Bucket: 'rohin-testing-bucket',
    Key: `images/${nanoid()}-${req.files.coverImg.name}`,
    Body: fileContent
  }
  const data = await s3.upload(params).promise()

  shelf = await Shelf.create({
    name: req.body.name,
    description: req.body.description,
    createdBy: 'rohin1212' || req.username,
    publicity: req.body.publicity,
    coverImg: data.Key
  })

  res.status(201).json({
    status: 'success',
    data: { shelf }
  })
})

exports.editShelf = asyncHandler(async (req, res, next) => {
  await db.sequelize.sync()
  const shelf = await Shelf.findOne({
    where: { slug: req.params.slug, createdBy: req.username }
  })
  if (shelf === null) {
    throw new AppError(
      'Unable to edit, shelf with the given id was not found',
      404
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
        slug: req.params.slug
      }
    }
  )
  res.status(200).json({
    status: 'success',
    message: 'The shelf has been updated'
  })
})

exports.deleteShelf = asyncHandler(async (req, res, next) => {
  await db.sequelize.sync()

  // check if the shelf exists, and if not throw an error

  const shelf = await Shelf.findOne({
    where: { slug: req.params.slug, createdBy: req.username }
  })
  if (shelf === null) {
    throw new AppError(
      'Unable to delete, shelf with the given id was not found',
      400
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
  await db.sequelize.sync({ force: false })

  // find the shelf and if it does not exist, throw an error
  const shelf = await Shelf.findOne({
    where: { slug: req.params.slug, createdBy: req.username }
  })
  if (shelf === null) {
    throw new AppError('The shelf with this slug does not exist', 404)
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
    throw new AppError('This item has already been added to this shelf', 400)
  }
  res.status(200).json({
    status: 'success',
    message: 'The item has been added to the shelf'
  })
})

exports.deleteMediaFromShelf = asyncHandler(async (req, res, next) => {
  await db.sequelize.sync({ force: false })
  console.log(req.params)
  // find the shelf and if it does not exist, throw an error
  const shelf = await Shelf.findOne({
    where: { slug: req.params.slug, createdBy: req.username }
  })
  if (shelf === null) {
    throw new AppError('The shelf with this slug does not exist', 404)
  }

  // if the media has not been already added to shelf, throw an error
  const mediaShelf = await ShelfMedia.findOne({
    where: { MediaId: req.params.mediaId, ShelfId: shelf.id }
  })
  if (mediaShelf === null) {
    throw new AppError('This item does not exist in this shelf', 404)
  }

  await ShelfMedia.destroy({
    where: { MediaId: req.params.mediaId, ShelfId: shelf.id }
  })
  res.status(204).json({
    status: 'success',
    message: 'The item has been deleted from the shelf'
  })
})
