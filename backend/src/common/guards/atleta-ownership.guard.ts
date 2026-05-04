import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AccessControlService } from '../services/access-control.service';

@Injectable()
export class AtletaOwnershipGuard implements CanActivate {
  constructor(private readonly accessControl: AccessControlService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Agregado por JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Extraer atletaId del body o params
    const atletaId = BigInt(request.body?.atletaId || request.params?.atletaId || 0);

    if (!atletaId) {
      throw new BadRequestException('ID de atleta no proporcionado en la solicitud');
    }

    // Delegar la verificacion al servicio centralizado
    const hasAccess = await this.accessControl.checkAtletaOwnership(user.id, user.rol, atletaId);

    if (!hasAccess) {
      throw new ForbiddenException(
        `No tienes permiso para acceder a los datos del atleta ${atletaId}. Solo puedes acceder a tus atletas asignados.`
      );
    }

    return true;
  }
}
