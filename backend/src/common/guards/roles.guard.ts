import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Guard para verificar que el usuario tiene los roles requeridos
// Se usa junto con el decorator @Roles('ADMIN', 'ENTRENADOR', etc.)
// IMPORTANTE: Debe usarse DESPUES de JwtAuthGuard en el orden de guards
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos del metadata del decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos, permitir acceso
    if (!requiredRoles) {
      return true;
    }

    // Obtener el usuario del request (inyectado por JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some((role) => user.rol === role);
  }
}
