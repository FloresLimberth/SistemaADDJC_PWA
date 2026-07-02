import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuditLogService } from '../services/audit-log.service';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator';

// Interceptor global para registrar activity logs automaticamente
// Solo loggea endpoints marcados con @AuditLog decorator
// Se ejecuta despues de que el handler responde (exito o error)
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Leer metadata del decorador @AuditLog
    const auditMetadata = this.reflector.get<AuditLogMetadata>(AUDIT_LOG_KEY, context.getHandler());

    // Si no tiene decorador @AuditLog, no interceptar
    if (!auditMetadata) {
      return next.handle();
    }

    // Obtener datos del request
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Inyectado por JwtStrategy
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Obtener recursoId del params (si existe)
    const paramId = request.params?.id;

    return next.handle().pipe(
      // En caso de exito
      tap((response) => {
        // Intentar obtener recursoId del response si no estaba en params
        // Util para operaciones CREATE donde el ID se genera
        const recursoId = this.extractRecursoId(paramId, response);

        // Para LOGIN: extraer userId del response (user.id) ya que no hay request.user
        const usuarioId = this.extractUsuarioId(user, response, auditMetadata.accion);

        // Registrar log de forma asincrona (no bloquea respuesta)
        this.auditLogService.registrar({
          usuarioId,
          accion: auditMetadata.accion,
          recurso: auditMetadata.recurso,
          recursoId: recursoId,
          ip,
          userAgent,
          exito: true,
        });
      }),
      // En caso de error
      catchError((error) => {
        // Registrar log de fallo
        this.auditLogService.registrar({
          usuarioId: user?.userId ? BigInt(user.userId) : null,
          accion: auditMetadata.accion,
          recurso: auditMetadata.recurso,
          recursoId: paramId ? BigInt(paramId) : null,
          ip,
          userAgent,
          exito: false,
        });

        // Re-lanzar el error para que lo maneje el filter de excepciones
        return throwError(() => error);
      })
    );
  }

  // Extrae la IP del cliente, considerando proxies
  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      // x-forwarded-for puede tener multiples IPs separadas por coma
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.connection?.remoteAddress || 'unknown';
  }

  // Extrae el recursoId del paramId o del response
  private extractRecursoId(paramId: string | undefined, response: any): bigint | null {
    // Primero intentar del param
    if (paramId) {
      try {
        return BigInt(paramId);
      } catch {
        return null;
      }
    }

    // Luego intentar del response (para CREATE)
    if (response?.id) {
      try {
        // El id puede venir como string (ya transformado por BigIntTransformInterceptor)
        return BigInt(response.id);
      } catch {
        return null;
      }
    }

    return null;
  }

  // Extrae el usuarioId del request.user o del response (para LOGIN)
  private extractUsuarioId(user: any, response: any, accion: string): bigint | null {
    // Si hay usuario autenticado en el request, usarlo
    // JwtStrategy retorna { id, email, nombreCompleto, rol }
    if (user?.id) {
      try {
        return BigInt(user.id);
      } catch {
        return null;
      }
    }

    // Para LOGIN: el response contiene { user: { id: ... }, accessToken: ... }
    if (accion === 'LOGIN' && response?.user?.id) {
      try {
        return BigInt(response.user.id);
      } catch {
        return null;
      }
    }

    return null;
  }
}
