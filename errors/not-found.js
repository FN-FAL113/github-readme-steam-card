const { StatusCodes } = require('http-status-codes');
const CustomError = require('./custom-error');

class NotFoundError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;