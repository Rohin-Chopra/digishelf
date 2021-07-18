const AppError = require('./AppError')

module.exports =
  (fn) =>
  (...args) => {
    const fnReturn = fn(...args)
    return Promise.resolve(fnReturn).catch((error) => {
      console.log(error)

      if (!(error instanceof AppError)) {
        error.statusCode = 500
        error.message = 'Internal Server Error'
        error.status = 'error'
      }

      return {
        headers: {
          'Content-Type': 'application/json'
        },
        statusCode: error.statusCode,
        body: { status: error.status, message: error.message }
      }
    })
  }
