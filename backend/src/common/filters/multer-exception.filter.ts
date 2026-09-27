import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';

/**
 * Catches Multer-specific errors (file too large, too many files, etc.)
 * and returns a descriptive JSON response instead of a generic failure.
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = 'File is too large. Maximum allowed size is 5 MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        status = HttpStatus.BAD_REQUEST;
        message = 'Too many files uploaded. Only one file is allowed per request.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        status = HttpStatus.BAD_REQUEST;
        message = `Unexpected file field: '${exception.field}'. Use the 'file' field to upload.`;
        break;
      case 'LIMIT_FIELD_KEY':
        status = HttpStatus.BAD_REQUEST;
        message = 'A form field name is too long.';
        break;
      case 'LIMIT_FIELD_VALUE':
        status = HttpStatus.BAD_REQUEST;
        message = 'A form field value is too long.';
        break;
      case 'LIMIT_FIELD_COUNT':
        status = HttpStatus.BAD_REQUEST;
        message = 'Too many form fields submitted.';
        break;
      case 'LIMIT_PART_COUNT':
        status = HttpStatus.BAD_REQUEST;
        message = 'Too many parts in the multipart request.';
        break;
      default:
        status = HttpStatus.BAD_REQUEST;
        message = `File upload error: ${exception.message}`;
        break;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: 'Upload Failed',
      message,
    });
  }
}
