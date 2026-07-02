import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

// Tipos de respuesta de error estructurada (RFC 7807/9457)
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  correlationId: string;
  details?: any;
  stack?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Generar correlation ID para rastrear el error
    const correlationId = this.generateCorrelationId();

    // Determinar status code y mensaje
    const { statusCode, message, error, details } = this.parseException(exception);

    // Construir respuesta estructurada
    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      method: request.method,
      message,
      error,
      correlationId,
    };

    // Agregar detalles adicionales en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      if (details) {
        errorResponse.details = details;
      }
      if (exception instanceof Error && exception.stack) {
        errorResponse.stack = exception.stack;
      }
    }

    // Logging estructurado
    this.logError(exception, correlationId, statusCode, request);

    // Enviar respuesta
    httpAdapter.reply(response, errorResponse, statusCode);
  }

  /**
   * Parsear excepcion para extraer informacion relevante
   */
  private parseException(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
    details?: any;
  } {
    // 1. HttpException (NestJS)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // Si la respuesta es un objeto con mensaje personalizado
      if (typeof response === 'object' && 'message' in response) {
        return {
          statusCode: status,
          message: Array.isArray(response.message)
            ? response.message.join(', ')
            : String(response.message),
          error: exception.name,
          details: 'error' in response ? response.error : undefined,
        };
      }

      return {
        statusCode: status,
        message: exception.message,
        error: exception.name,
      };
    }

    // 2. Prisma Client Known Request Error (P2xxx)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    // 3. Prisma Validation Error
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Datos de entrada invalidos para la operacion de base de datos',
        error: 'PrismaValidationError',
        details: process.env.NODE_ENV !== 'production' ? exception.message : undefined,
      };
    }

    // 4. Prisma Client Initialization Error
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Error al conectar con la base de datos',
        error: 'DatabaseConnectionError',
      };
    }

    // 5. Prisma Client Rust Panic Error
    if (exception instanceof Prisma.PrismaClientRustPanicError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error critico en el motor de base de datos',
        error: 'DatabaseEngineError',
      };
    }

    // 6. Error generico de JavaScript
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Error interno del servidor',
        error: exception.name || 'InternalServerError',
      };
    }

    // 7. Excepcion desconocida
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error inesperado del servidor',
      error: 'UnknownError',
      details: process.env.NODE_ENV !== 'production' ? String(exception) : undefined,
    };
  }

  /**
   * Mapear errores de Prisma a HTTP status codes
   */
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
    error: string;
    details?: any;
  } {
    const isDev = process.env.NODE_ENV !== 'production';

    switch (error.code) {
      // P2000: Valor demasiado largo para la columna
      case 'P2000':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'El valor proporcionado es demasiado largo',
          error: 'ValueTooLong',
          details: isDev ? { field: error.meta?.column_name } : undefined,
        };

      // P2001: Registro no encontrado (WHERE condition)
      case 'P2001':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'El registro solicitado no fue encontrado',
          error: 'RecordNotFound',
          details: isDev ? { model: error.meta?.modelName } : undefined,
        };

      // P2002: Restriccion de unicidad violada
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Ya existe un registro con estos datos',
          error: 'UniqueConstraintViolation',
          details: isDev ? { fields: error.meta?.target } : undefined,
        };

      // P2003: Restriccion de clave foranea violada
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Referencia a un registro que no existe',
          error: 'ForeignKeyConstraintViolation',
          details: isDev ? { field: error.meta?.field_name } : undefined,
        };

      // P2025: Registro no encontrado (operaciones update/delete)
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'El registro que intentas modificar no existe',
          error: 'RecordNotFound',
          details: isDev ? { cause: error.meta?.cause } : undefined,
        };

      // P2014: Restriccion de relacion violada
      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No se puede realizar la operacion debido a restricciones de relacion',
          error: 'RelationViolation',
          details: isDev ? { relation: error.meta?.relation_name } : undefined,
        };

      // P2015: Registro relacionado no encontrado
      case 'P2015':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'El registro relacionado no fue encontrado',
          error: 'RelatedRecordNotFound',
          details: isDev ? { relation: error.meta?.relation_name } : undefined,
        };

      // P2016: Error de interpretacion de query
      case 'P2016':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error en la consulta a la base de datos',
          error: 'QueryInterpretationError',
          details: isDev ? { details: error.meta?.details } : undefined,
        };

      // P2021: Tabla no existe
      case 'P2021':
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error de configuracion de base de datos',
          error: 'TableNotFound',
          details: isDev ? { table: error.meta?.table } : undefined,
        };

      // P2022: Columna no existe
      case 'P2022':
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error de configuracion de base de datos',
          error: 'ColumnNotFound',
          details: isDev ? { column: error.meta?.column } : undefined,
        };

      // Otros codigos de error Prisma
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error de base de datos',
          error: 'DatabaseError',
          details: isDev ? { code: error.code, meta: error.meta } : undefined,
        };
    }
  }

  /**
   * Log estructurado de errores
   */
  private logError(
    exception: unknown,
    correlationId: string,
    statusCode: number,
    request: Request
  ): void {
    const logContext = {
      correlationId,
      statusCode,
      method: request.method,
      path: request.url,
      userId: (request as any).user?.sub || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    // Errores 5xx: log como ERROR (requieren atencion)
    if (statusCode >= 500) {
      this.logger.error(
        `[${correlationId}] Internal Server Error: ${this.getErrorMessage(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext)
      );
    }
    // Errores 4xx: log como WARN (errores de cliente)
    else if (statusCode >= 400) {
      this.logger.warn(
        `[${correlationId}] Client Error: ${this.getErrorMessage(exception)}`,
        JSON.stringify(logContext)
      );
    }
    // Otros: log como LOG
    else {
      this.logger.log(
        `[${correlationId}] ${this.getErrorMessage(exception)}`,
        JSON.stringify(logContext)
      );
    }
  }

  /**
   * Obtener mensaje de error
   */
  private getErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }
    return String(exception);
  }

  /**
   * Generar ID unico para rastrear errores
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
