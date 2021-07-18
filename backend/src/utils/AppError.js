class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = String(this.statusCode).startsWith('4') ? 'fail' : 'error'
  }
}

module.exports = AppError
