import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    // Mapeo de códigos de error de Prisma a códigos HTTP
    switch (exception.code) {
      // Violación de restricción única (email, CI, etc.)
      case 'P2002': {
        const target = exception.meta?.target as string[] | undefined;
        const field = target && target.length > 0 ? target[0] : 'campo';
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `El ${field} ya está registrado`,
          error: 'Conflict',
        });
        break;
      }

      // Registro no encontrado
      case 'P2025': {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Registro no encontrado',
          error: 'Not Found',
        });
        break;
      }

      // Violación de clave foránea
      case 'P2003': {
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Violación de relación: el registro referenciado no existe',
          error: 'Bad Request',
        });
        break;
      }

      // Violación de restricción de check
      case 'P2004': {
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Los datos no cumplen con las restricciones de validación',
          error: 'Bad Request',
        });
        break;
      }

      // Violación de dependencia (no se puede eliminar porque tiene dependientes)
      case 'P2014': {
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'No se puede eliminar el registro porque tiene registros dependientes',
          error: 'Conflict',
        });
        break;
      }

      // Tiempo de espera de conexión
      case 'P1008': {
        response.status(HttpStatus.REQUEST_TIMEOUT).json({
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: 'Tiempo de espera de conexión a la base de datos agotado',
          error: 'Request Timeout',
        });
        break;
      }

      // Error por defecto
      default: {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          error: 'Internal Server Error',
          details: message,
        });
        break;
      }
    }
  }
}
