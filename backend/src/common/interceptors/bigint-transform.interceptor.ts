import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

// Interceptor global para transformar BigInt, Decimal y Date en todas las respuestas
// Elimina la necesidad de metodos formatResponse en cada servicio
// Aplica transformacion recursiva en objetos anidados y arrays
@Injectable()
export class BigIntTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }

  private transform(data: any): any {
    // Si es null o undefined, retornar sin modificar
    if (data === null || data === undefined) {
      return data;
    }

    // Si es BigInt, convertir a string
    if (typeof data === 'bigint') {
      return data.toString();
    }

    // Si es Date, convertir a ISO string
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Si es Prisma.Decimal, convertir a number
    if (
      data instanceof Prisma.Decimal ||
      (data.constructor && data.constructor.name === 'Decimal')
    ) {
      return parseFloat(data.toString());
    }

    // Si es array, aplicar transformacion a cada elemento
    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item));
    }

    // Si es objeto, aplicar transformacion a cada propiedad
    if (typeof data === 'object') {
      const transformed: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          transformed[key] = this.transform(data[key]);
        }
      }
      return transformed;
    }

    // Para tipos primitivos (string, number, boolean), retornar sin modificar
    return data;
  }
}
