import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

const HINGLISH_STATUS_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Galat jankari di gayi hai. Kripya check karke dobara try karein.',
  [HttpStatus.UNAUTHORIZED]: 'Aap login nahi hain ya session expire ho chuka hai.',
  [HttpStatus.FORBIDDEN]: 'Aapko yeh action karne ki permission nahi hai.',
  [HttpStatus.NOT_FOUND]: 'Record nahi mila.',
  [HttpStatus.CONFLICT]: 'Yeh record pehle se maujood hai.',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'System me koi takleef aayi hai. Kripya thodi der baad koshish karein.',
};

@Catch()
export class HinglishExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Kuch gadbad hui. Dobara try karein.';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, any>;
        message = body.message || HINGLISH_STATUS_MAP[status] || exception.message;
        errorName = body.error || exception.name;
      }
    } else if (exception instanceof Error) {
      console.error('Unhandled exception:', exception);
      message = exception.message || 'System me anjaan khata aayi hai.';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error: errorName,
    });
  }
}
