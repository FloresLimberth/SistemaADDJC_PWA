import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      // Extraer el token JWT del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // No ignorar tokens expirados (si expira, rechazar la petición)
      ignoreExpiration: false,

      // Secret para validar la firma del token (mismo que usamos para generarlo)
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  // Este método se ejecuta automáticamente después de validar el token
  // Recibe el payload decodificado del token
  async validate(payload: any) {
    // Payload contiene: { sub: userId (string), email, rol }

    // Convertir el ID de string a BigInt para buscar en la BD
    const userId = BigInt(payload.sub);

    // Verificar que el usuario todavía existe en la base de datos
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        rol: true,
        estado: true,
      },
    });

    // Si el usuario no existe o está inactivo, rechazar
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.estado === false) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornar el usuario completo
    // Este objeto se guardará en request.user y estará disponible en los controllers
    // Convertir BigInt a String para que pueda ser serializado a JSON
    return {
      id: user.id.toString(),
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      rol: user.rol,
    };
  }
}
