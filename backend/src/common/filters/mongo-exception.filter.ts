import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Handles only Mongoose-specific errors (duplicate key, invalid ObjectId).
 * All other exceptions (including ValidationPipe errors) are left to NestJS's
 * built-in exception handler, which formats them correctly.
 */
@Catch(MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongooseError & { code?: number; keyPattern?: Record<string, number> }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle Mongoose CastError (invalid ObjectId)
    if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.NOT_FOUND;
      message = `Resource not found: Invalid ${exception.path}`;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
