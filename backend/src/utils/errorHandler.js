const AppError = require('./AppError')

module.exports = (err, req, res, next) => {
  console.log(err.name)
  console.log(err.message)
  console.log(err.stack)

  if (!(err instanceof AppError)) {
    err.statusCode = 500
    err.message = 'Internal Server Error'
    err.status = 'error'
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  })
}
