import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Guard para proteger rutas que requieren autenticacion JWT
// Simplemente extiende AuthGuard('jwt') que usa nuestra JwtStrategy
// Respeta el decorator @Public() para permitir rutas sin autenticacion
// Uso: @UseGuards(JwtAuthGuard) en controllers o metodos
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si la ruta esta marcada como publica con @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si es publica, permitir acceso sin validar token
    if (isPublic) {
      return true;
    }

    // Si no es publica, ejecutar la validacion JWT normal
    return super.canActivate(context);
  }
}
