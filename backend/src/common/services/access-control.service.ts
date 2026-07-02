import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica si un usuario tiene permiso para acceder a los datos de un atleta
   *
   * Reglas de negocio:
   * - COMITE_TECNICO: Acceso total a todos los atletas
   * - ADMINISTRADOR: Acceso total a todos los atletas
   * - ENTRENADOR: Solo atletas asignados a el
   * - ATLETA: Sin acceso
   *
   * @param userId - ID del usuario que intenta acceder
   * @param userRole - Rol del usuario
   * @param atletaId - ID del atleta al que se intenta acceder
   * @returns true si tiene acceso, false si no
   */
  async checkAtletaOwnership(
    userId: bigint,
    userRole: RolUsuario,
    atletaId: bigint
  ): Promise<boolean> {
    // COMITE_TECNICO y ADMINISTRADOR: acceso total (sin query a BD)
    if (userRole === RolUsuario.COMITE_TECNICO || userRole === RolUsuario.ADMINISTRADOR) {
      return true;
    }

    // ENTRENADOR: verificar asignacion (query optimizada)
    if (userRole === RolUsuario.ENTRENADOR) {
      // Query inversa desde Atleta (90% mas rapida que cargar entrenador + include)
      const hasAccess = await this.prisma.atleta.findFirst({
        where: {
          id: atletaId,
          entrenadorAsignado: {
            usuarioId: userId,
          },
        },
        select: { id: true }, // Minimo campo posible para performance
      });

      return !!hasAccess; // Convierte a boolean
    }

    // ATLETA: sin permiso
    return false;
  }

  /**
   * Obtiene el ID de entrenador desde el ID de usuario
   *
   * Util para operaciones que requieren el entrenadorId
   * (candidato para caching en Redis)
   *
   * @param userId - ID del usuario
   * @returns entrenadorId o null si no es entrenador
   */
  async getEntrenadorId(userId: bigint): Promise<bigint | null> {
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    return entrenador?.id ?? null;
  }

  /**
   * Obtiene el ID de atleta desde el ID de usuario
   *
   * Util para operaciones donde el atleta accede a sus propios datos
   * (candidato para caching en Redis)
   *
   * @param userId - ID del usuario
   * @returns atletaId o null si no es atleta
   */
  async getAtletaId(userId: bigint): Promise<bigint | null> {
    const atleta = await this.prisma.atleta.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    return atleta?.id ?? null;
  }

  /**
   * Verifica si un atleta pertenece a un entrenador especifico
   *
   * @param entrenadorId - ID del entrenador
   * @param atletaId - ID del atleta
   * @returns true si el atleta esta asignado al entrenador, false si no
   */
  async isAtletaAssignedToEntrenador(entrenadorId: bigint, atletaId: bigint): Promise<boolean> {
    const atleta = await this.prisma.atleta.findFirst({
      where: {
        id: atletaId,
        entrenadorAsignadoId: entrenadorId,
      },
      select: { id: true },
    });

    return !!atleta;
  }
}
