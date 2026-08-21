import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const normalized = this.normalize(exception);

    const logPayload = {
      method: request.method,
      path: request.url,
      statusCode: normalized.statusCode,
      message: normalized.message,
    };

    if (normalized.statusCode >= 500) {
      this.logger.error(
        logPayload,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(logPayload);
    }

    response.status(normalized.statusCode).json({
      statusCode: normalized.statusCode,
      message: normalized.message,
      error: normalized.error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalize(exception: unknown) {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'object' && payload !== null) {
        const body = payload as { message?: string | string[]; error?: string };
        return {
          statusCode,
          message: body.message || exception.message,
          error: body.error || exception.name,
        };
      }

      return {
        statusCode,
        message: payload || exception.message,
        error: exception.name,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Registro duplicado',
          error: 'Conflict',
        };
      }

      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Registro nao encontrado',
          error: 'Not Found',
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
      error: 'Internal Server Error',
    };
  }
}
