import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { AuthService } from '../auth/auth.service';
import {
  CreateEntrenadorDto,
  UpdateEntrenadorDto,
  QueryEntrenadorDto,
  AssignAtletaDto,
  EntrenadorResponseDto,
} from './dto';

@Injectable()
export class EntrenadoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly authService: AuthService
  ) {}

  // Crear un nuevo entrenador (incluye crear usuario con rol ENTRENADOR)
  async create(createEntrenadorDto: CreateEntrenadorDto): Promise<EntrenadorResponseDto> {
    // Verificar que el email no exista
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: createEntrenadorDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el CI no exista
    const existingCI = await this.prisma.usuario.findUnique({
      where: { ci: createEntrenadorDto.ci },
    });

    if (existingCI) {
      throw new ConflictException('El CI ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await this.authService.hashPassword(createEntrenadorDto.contrasena);

    // Crear usuario + entrenador en una transaccion
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear usuario con rol ENTRENADOR
      const usuario = await tx.usuario.create({
        data: {
          ci: createEntrenadorDto.ci,
          nombreCompleto: createEntrenadorDto.nombreCompleto,
          email: createEntrenadorDto.email,
          contrasena: hashedPassword,
          rol: 'ENTRENADOR', // Rol fijo para entrenadores
          estado: true,
        },
      });

      // Crear entrenador asociado al usuario
      const entrenador = await tx.entrenador.create({
        data: {
          usuarioId: usuario.id,
          municipio: createEntrenadorDto.municipio,
          especialidad: createEntrenadorDto.especialidad,
        },
        select: {
          id: true,
          usuarioId: true,
          municipio: true,
          especialidad: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              ci: true,
              nombreCompleto: true,
              email: true,
              estado: true,
            },
          },
        },
      });

      return entrenador;
    });

    return result;
  }

  // Listar entrenadores con filtros y paginacion
  async findAll(queryDto: QueryEntrenadorDto) {
    const { nombreCompleto, municipio, especialidad, estado, page = 1, limit = 10 } = queryDto;

    // Construir filtros dinamicos
    const where: any = {};

    if (nombreCompleto) {
      where.usuario = {
        nombreCompleto: { contains: nombreCompleto, mode: 'insensitive' },
      };
    }

    if (municipio) {
      where.municipio = { contains: municipio, mode: 'insensitive' };
    }

    if (especialidad) {
      where.especialidad = { contains: especialidad, mode: 'insensitive' };
    }

    if (estado !== undefined) {
      where.usuario = { ...where.usuario, estado };
    }

    // Calcular skip para paginacion
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo
    const [entrenadores, total] = await Promise.all([
      this.prisma.entrenador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          usuarioId: true,
          municipio: true,
          especialidad: true,
          createdAt: true,
          updatedAt: true,
          usuario: {
            select: {
              id: true,
              ci: true,
              nombreCompleto: true,
              email: true,
              estado: true,
            },
          },
          _count: {
            select: {
              atletasAsignados: true,
            },
          },
        },
      }),
      this.prisma.entrenador.count({ where }),
    ]);

    // Formatear respuesta para incluir atletasAsignadosCount
    const formattedData = entrenadores.map((e) => ({
      id: e.id,
      usuarioId: e.usuarioId,
      municipio: e.municipio,
      especialidad: e.especialidad,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      usuario: e.usuario,
      atletasAsignadosCount: e._count.atletasAsignados,
    }));

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un entrenador por ID
  async findOne(id: string): Promise<EntrenadorResponseDto> {
    const entrenadorId = BigInt(id);

    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenadorId },
      select: {
        id: true,
        usuarioId: true,
        municipio: true,
        especialidad: true,
        createdAt: true,
        updatedAt: true,
        usuario: {
          select: {
            id: true,
            ci: true,
            nombreCompleto: true,
            email: true,
            estado: true,
          },
        },
        _count: {
          select: {
            atletasAsignados: true,
          },
        },
      },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Formatear respuesta para incluir atletasAsignadosCount
    return {
      ...entrenador,
      atletasAsignadosCount: entrenador._count.atletasAsignados,
    };
  }

  // Actualizar un entrenador
  async update(
    id: string,
    updateEntrenadorDto: UpdateEntrenadorDto
  ): Promise<EntrenadorResponseDto> {
    const entrenadorId = BigInt(id);

    // Verificar que el entrenador exista
    const existingEntrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenadorId },
    });

    if (!existingEntrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Extraer estado del DTO (pertenece a Usuario, no a Entrenador)
    const { estado, ...entrenadorFields } = updateEntrenadorDto;

    // Si viene estado, actualizar el usuario asociado
    if (estado !== undefined) {
      await this.prisma.usuario.update({
        where: { id: existingEntrenador.usuarioId },
        data: { estado },
      });
    }

    // Actualizar el entrenador con los campos restantes
    const updatedEntrenador = await this.prisma.entrenador.update({
      where: { id: entrenadorId },
      data: entrenadorFields,
      select: {
        id: true,
        usuarioId: true,
        municipio: true,
        especialidad: true,
        createdAt: true,
        updatedAt: true,
        usuario: {
          select: {
            id: true,
            ci: true,
            nombreCompleto: true,
            email: true,
            estado: true,
          },
        },
      },
    });

    return updatedEntrenador;
  }

  // Eliminar un entrenador (hard delete - elimina usuario + entrenador por cascade)
  async remove(id: string): Promise<{ message: string }> {
    const entrenadorId = BigInt(id);

    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenadorId },
      include: {
        usuario: true,
        atletasAsignados: true,
      },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Verificar si tiene atletas asignados
    if (entrenador.atletasAsignados.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el entrenador porque tiene ${entrenador.atletasAsignados.length} atleta(s) asignado(s). Reasigne los atletas primero.`
      );
    }

    // Eliminar el usuario (el entrenador se elimina por cascade)
    await this.prisma.usuario.delete({
      where: { id: entrenador.usuarioId },
    });

    return { message: 'Entrenador eliminado permanentemente' };
  }

  // Asignar un atleta a este entrenador
  async assignAtleta(
    entrenadorId: string,
    assignAtletaDto: AssignAtletaDto
  ): Promise<{ message: string }> {
    const entrenaderId = BigInt(entrenadorId);
    const atletaId = BigInt(assignAtletaDto.atletaId);

    // Verificar que el entrenador exista
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenaderId },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Verificar que el atleta exista
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
    });

    if (!atleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Asignar el entrenador al atleta
    await this.prisma.atleta.update({
      where: { id: atletaId },
      data: {
        entrenadorAsignadoId: entrenaderId,
      },
    });

    return { message: 'Atleta asignado exitosamente al entrenador' };
  }

  // Obtener todos los atletas asignados a un entrenador (con validación de ownership)
  async getAtletas(entrenadorId: string, userId: bigint, rol: string) {
    const entrenaderId = BigInt(entrenadorId);

    // Si es ENTRENADOR, validar que solo vea sus propios atletas
    if (rol === 'ENTRENADOR') {
      const entrenadorAutenticadoId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorAutenticadoId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Verificar que el entrenadorId solicitado sea el suyo
      if (entrenadorAutenticadoId !== entrenaderId) {
        throw new ForbiddenException('No tienes permiso para ver los atletas de otro entrenador');
      }
    }

    // Verificar que el entrenador exista
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { id: entrenaderId },
      include: {
        usuario: {
          select: {
            nombreCompleto: true,
          },
        },
        atletasAsignados: {
          include: {
            usuario: {
              select: {
                id: true,
                nombreCompleto: true,
              },
            },
          },
        },
      },
    });

    if (!entrenador) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Formatear atletas
    const atletas = entrenador.atletasAsignados.map((atleta) => ({
      id: atleta.id.toString(),
      nombreCompleto: atleta.usuario.nombreCompleto,
      club: atleta.club,
      categoria: atleta.categoria,
      categoriaPeso: atleta.categoriaPeso,
      pesoActual: atleta.pesoActual ? parseFloat(atleta.pesoActual.toString()) : null,
    }));

    return {
      entrenadorId: entrenador.id.toString(),
      nombreCompleto: entrenador.usuario.nombreCompleto,
      totalAtletas: atletas.length,
      atletas,
    };
  }
}
