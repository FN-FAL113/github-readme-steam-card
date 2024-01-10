import { StatusCodes } from 'http-status-codes';
import { ICustomError } from '../types/error';

class NotFoundError extends Error implements ICustomError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

export default NotFoundError;