import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface CustomExceptionResponse {
  message?: string;
  errorCode?: string;
  statusCode?: number;
}

// Type guard function to check if an object is our custom response
function isCustomExceptionResponse(
  obj: unknown,
): obj is CustomExceptionResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('message' in obj || 'errorCode' in obj || 'statusCode' in obj)
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isCustomExceptionResponse(exceptionResponse)) {
        // TypeScript now knows this has the correct shape
        message = exceptionResponse.message || message;
        errorCode = exceptionResponse.errorCode;

        // Optionally override statusCode if provided
        if (exceptionResponse.statusCode) {
          statusCode = exceptionResponse.statusCode;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Convert enum to number for comparison
    const statusCodeValue = Number(statusCode);
    const statusText =
      statusCodeValue >= 400 && statusCodeValue < 500 ? 'fail' : 'error';

    response.status(statusCode).json({
      status: statusText,
      statusCode: Number(statusCode),
      errorCode,
      message,
    });
  }
}
