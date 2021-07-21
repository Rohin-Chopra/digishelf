const express = require('express')
const fileUpload = require('express-fileupload')
const { getCurrentInvoke } = require('@vendia/serverless-express')

const app = express()
app.use(express.json())

const shelfRouter = require('./routes/shelfRouter')
const errorHandler = require('./utils/errorHandler')

app.use(fileUpload())

app.use((req, res, next) => {
  const { event } = getCurrentInvoke()

  req.username = 'rohin1212' || event.requestContext.authorizer.claims.username
  next()
})

app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Welcome to DigiShelf API'
  })
})

app.use('/shelves', shelfRouter)

app.use(errorHandler)

module.exports = app
