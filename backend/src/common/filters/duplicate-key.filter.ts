import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches MongoDB driver duplicate key errors (E11000).
 * These are thrown by the driver as plain objects with a `code` property,
 * not as Mongoose errors.
 */
@Catch()
export class DuplicateKeyFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Only handle MongoDB duplicate key errors; re-throw everything else
    if (exception?.code !== 11000) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const field = Object.keys(exception.keyPattern ?? {})[0] ?? 'field';

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: `Duplicate value for '${field}'. Please use another value.`,
    });
  }
}
