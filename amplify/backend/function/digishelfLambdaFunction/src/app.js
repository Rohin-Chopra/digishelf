const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { getCurrentInvoke } = require('@vendia/serverless-express')
const morgan = require('morgan')

const sequelize = require('./config/db')
;(async () => {
  await sequelize.sync({ force: false })
  console.log('Connected to the database')
})()

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use(morgan('tiny'))

const shelfRouter = require('./routes/shelfRouter')
const mediaRouter = require('./routes/mediaRouter')
const errorHandler = require('./utils/errorHandler')

app.use(fileUpload())

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const { event } = getCurrentInvoke()
    if (
      event.requestContext.authorizer &&
      event.requestContext.authorizer.claims
    ) {
      req.username = event.requestContext.authorizer.claims.email
    }
  } else {
    req.username = 'test'
  }
  next()
})

app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Welcome to DigiShelf API'
  })
})

app.use('/shelves', shelfRouter)
app.use('/media', mediaRouter)

app.use(errorHandler)

module.exports = app
