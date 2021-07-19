const errorHandler = require('./utils/errorHandler')
exports.index = errorHandler(async (event, context) => {
  return {
    statusCode: 200,
    body: 'Welcome to DigiShelf API'
  }
})
