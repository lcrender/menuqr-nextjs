import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  path?: string;
  timestamp?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, logStack } = this.resolveException(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${this.messageToString(message)}`,
        logStack,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} → ${status}: ${this.messageToString(message)}`,
      );
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      error: this.statusLabel(status),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string | string[];
    logStack?: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return {
        status,
        message: this.extractHttpExceptionMessage(exception),
        logStack: exception.stack,
      };
    }

    if (exception instanceof Error) {
      const pgMessage = this.getPostgresUserMessage(exception);
      if (pgMessage) {
        return { status: HttpStatus.BAD_REQUEST, message: pgMessage, logStack: exception.stack };
      }

      const inferred = this.inferFromErrorMessage(exception.message);
      if (inferred) {
        return { status: inferred.status, message: inferred.message, logStack: exception.stack };
      }

      const isProd = process.env.NODE_ENV === 'production';
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: isProd
          ? 'No se pudo completar la operación. Intentá de nuevo o contactá soporte si el problema continúa.'
          : exception.message || 'Error interno del servidor',
        logStack: exception.stack,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Ocurrió un error inesperado.',
      logStack: String(exception),
    };
  }

  private extractHttpExceptionMessage(exception: HttpException): string | string[] {
    const res = exception.getResponse();
    if (typeof res === 'string') {
      return res;
    }
    if (res && typeof res === 'object' && 'message' in res) {
      const msg = (res as { message?: string | string[] }).message;
      if (Array.isArray(msg) && msg.length > 0) {
        return msg;
      }
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }
    return exception.message;
  }

  private getPostgresUserMessage(error: Error): string | null {
    const err = error as Error & { code?: string; detail?: string };
    switch (err.code) {
      case '23505':
        return 'Ya existe un registro con esos datos. Revisá nombre, slug u otros campos únicos.';
      case '23503':
        return 'No se puede completar la operación porque hay datos relacionados inválidos o inexistentes.';
      case '23502':
        return 'Faltan datos obligatorios para guardar.';
      case '22P02':
        return 'Alguno de los valores enviados no es válido.';
      case '23514':
        return 'Los datos no cumplen las reglas de validación.';
      default:
        break;
    }
    if (err.detail && process.env.NODE_ENV !== 'production') {
      return err.detail;
    }
    return null;
  }

  private inferFromErrorMessage(
    message: string,
  ): { status: number; message: string } | null {
    const trimmed = (message || '').trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    if (
      lower.includes('tenant id') ||
      lower.includes('tenantid') ||
      lower.includes('menu id') ||
      lower.includes('requerido') ||
      lower.includes('required') ||
      lower.includes('inválido') ||
      lower.includes('invalid')
    ) {
      return { status: HttpStatus.BAD_REQUEST, message: trimmed };
    }
    if (lower.includes('not found') || lower.includes('no encontrad')) {
      return { status: HttpStatus.NOT_FOUND, message: trimmed };
    }
    if (lower.includes('forbidden') || lower.includes('permiso') || lower.includes('no tenés')) {
      return { status: HttpStatus.FORBIDDEN, message: trimmed };
    }

    return null;
  }

  private statusLabel(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return map[status] ?? 'Error';
  }

  private messageToString(message: string | string[]): string {
    return Array.isArray(message) ? message.join('; ') : message;
  }
}
