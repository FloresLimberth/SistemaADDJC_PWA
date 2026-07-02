import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { CreateMacrocicloDto, UpdateMacrocicloDto, MacrocicloResponseDto } from '../dto';
import { EstadoMacrociclo } from '@prisma/client';

@Injectable()
export class MacrociclosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService
  ) {}

  // Crear un nuevo macrociclo
  @Transactional()
  async create(
    createMacrocicloDto: CreateMacrocicloDto,
    creadoPorUserId: string
  ): Promise<MacrocicloResponseDto> {
    // Validar que fechaFin > fechaInicio
    const fechaInicio = new Date(createMacrocicloDto.fechaInicio);
    const fechaFin = new Date(createMacrocicloDto.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Crear macrociclo
    const macrociclo = await this.prisma.macrociclo.create({
      data: {
        nombre: createMacrocicloDto.nombre,
        temporada: createMacrocicloDto.temporada,
        equipo: createMacrocicloDto.equipo,
        categoriaObjetivo: createMacrocicloDto.categoriaObjetivo,
        objetivo1: createMacrocicloDto.objetivo1,
        objetivo2: createMacrocicloDto.objetivo2,
        objetivo3: createMacrocicloDto.objetivo3,
        fechaInicio,
        fechaFin,
        estado: createMacrocicloDto.estado || EstadoMacrociclo.PLANIFICADO,
        creadoPor: BigInt(creadoPorUserId),
      },
      select: {
        id: true,
        nombre: true,
        temporada: true,
        equipo: true,
        categoriaObjetivo: true,
        objetivo1: true,
        objetivo2: true,
        objetivo3: true,
        fechaInicio: true,
        fechaFin: true,
        estado: true,
        creadoPor: true,
        createdAt: true,
        updatedAt: true,
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    return macrociclo;
  }

  // Listar todos los macrociclos con filtros y paginación
  async findAll(userId: bigint, rol: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {};

    // Si es ENTRENADOR, usar nested filter de Prisma (5 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Usar nested filter para filtrar macrociclos que tienen mesociclos con microciclos con atletas del entrenador
      where.mesociclos = {
        some: {
          microciclos: {
            some: {
              asignacionesAtletas: {
                some: {
                  atleta: {
                    entrenadorAsignadoId: entrenadorId,
                  },
                },
              },
            },
          },
        },
      };
    }

    // Si es ATLETA, usar nested filter de Prisma (4 queries → 1 query)
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Usar nested filter para filtrar macrociclos que tienen mesociclos con microciclos asignados al atleta
      where.mesociclos = {
        some: {
          microciclos: {
            some: {
              asignacionesAtletas: {
                some: {
                  atletaId,
                },
              },
            },
          },
        },
      };
    }

    const [macrociclos, total] = await Promise.all([
      this.prisma.macrociclo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nombre: true,
          temporada: true,
          equipo: true,
          categoriaObjetivo: true,
          objetivo1: true,
          objetivo2: true,
          objetivo3: true,
          fechaInicio: true,
          fechaFin: true,
          estado: true,
          creadoPor: true,
          createdAt: true,
          updatedAt: true,
          creador: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.macrociclo.count({ where }),
    ]);

    return {
      data: macrociclos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un macrociclo por ID (con validacion de ownership para ENTRENADOR)
  async findOne(id: string, userId: bigint, rol: string): Promise<MacrocicloResponseDto> {
    const macrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        nombre: true,
        temporada: true,
        equipo: true,
        categoriaObjetivo: true,
        objetivo1: true,
        objetivo2: true,
        objetivo3: true,
        fechaInicio: true,
        fechaFin: true,
        estado: true,
        creadoPor: true,
        createdAt: true,
        updatedAt: true,
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    if (!macrociclo) {
      throw new NotFoundException('Macrociclo no encontrado');
    }

    // Si es ENTRENADOR, validar usando nested filter (3 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Validar que existe al menos una asignacion usando nested filter
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          atleta: {
            entrenadorAsignadoId: entrenadorId,
          },
          microciclo: {
            mesociclo: {
              macrocicloId: macrociclo.id,
            },
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Macrociclo no encontrado o no autorizado');
      }
    }

    // Si es ATLETA, validar usando nested filter (ya optimizado)
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Verificar si el atleta esta asignado a algun microciclo de este macrociclo
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId,
          microciclo: {
            mesociclo: {
              macrocicloId: macrociclo.id,
            },
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Macrociclo no encontrado o no autorizado');
      }
    }

    return macrociclo;
  }

  // Actualizar un macrociclo
  @Transactional()
  async update(
    id: string,
    updateMacrocicloDto: UpdateMacrocicloDto
  ): Promise<MacrocicloResponseDto> {
    // Verificar que existe
    const existingMacrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingMacrociclo) {
      throw new NotFoundException('Macrociclo no encontrado');
    }

    // Validar fechas si se actualizan
    if (updateMacrocicloDto.fechaInicio || updateMacrocicloDto.fechaFin) {
      const fechaInicio = updateMacrocicloDto.fechaInicio
        ? new Date(updateMacrocicloDto.fechaInicio)
        : existingMacrociclo.fechaInicio;

      const fechaFin = updateMacrocicloDto.fechaFin
        ? new Date(updateMacrocicloDto.fechaFin)
        : existingMacrociclo.fechaFin;

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Actualizar
    const macrociclo = await this.prisma.macrociclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateMacrocicloDto.nombre && { nombre: updateMacrocicloDto.nombre }),
        ...(updateMacrocicloDto.temporada && { temporada: updateMacrocicloDto.temporada }),
        ...(updateMacrocicloDto.equipo && { equipo: updateMacrocicloDto.equipo }),
        ...(updateMacrocicloDto.categoriaObjetivo && {
          categoriaObjetivo: updateMacrocicloDto.categoriaObjetivo,
        }),
        ...(updateMacrocicloDto.objetivo1 && { objetivo1: updateMacrocicloDto.objetivo1 }),
        ...(updateMacrocicloDto.objetivo2 && { objetivo2: updateMacrocicloDto.objetivo2 }),
        ...(updateMacrocicloDto.objetivo3 && { objetivo3: updateMacrocicloDto.objetivo3 }),
        ...(updateMacrocicloDto.fechaInicio && {
          fechaInicio: new Date(updateMacrocicloDto.fechaInicio),
        }),
        ...(updateMacrocicloDto.fechaFin && { fechaFin: new Date(updateMacrocicloDto.fechaFin) }),
        ...(updateMacrocicloDto.estado && { estado: updateMacrocicloDto.estado }),
      },
      select: {
        id: true,
        nombre: true,
        temporada: true,
        equipo: true,
        categoriaObjetivo: true,
        objetivo1: true,
        objetivo2: true,
        objetivo3: true,
        fechaInicio: true,
        fechaFin: true,
        estado: true,
        creadoPor: true,
        createdAt: true,
        updatedAt: true,
        creador: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
      },
    });

    return macrociclo;
  }

  // Obtener informacion de eliminacion (conteo de registros hijos)
  // Usado por el frontend para mostrar advertencia antes de eliminar
  async getDeleteInfo(id: string): Promise<{
    nombre: string;
    mesociclos: number;
    microciclos: number;
    sesiones: number;
  }> {
    const macrociclo = await this.prisma.macrociclo.findUnique({
      where: { id: BigInt(id) },
      select: {
        nombre: true,
        mesociclos: {
          select: {
            id: true,
            microciclos: {
              select: {
                id: true,
                _count: {
                  select: { sesiones: true },
                },
              },
            },
          },
        },
      },
    });

    if (!macrociclo) {
      throw new NotFoundException('Macrociclo no encontrado');
    }

    // Calcular totales
    const mesociclosCount = macrociclo.mesociclos.length;
    let microciclosCount = 0;
    let sesionesCount = 0;

    for (const mesociclo of macrociclo.mesociclos) {
      microciclosCount += mesociclo.microciclos.length;
      for (const microciclo of mesociclo.microciclos) {
        sesionesCount += microciclo._count.sesiones;
      }
    }

    return {
      nombre: macrociclo.nombre,
      mesociclos: mesociclosCount,
      microciclos: microciclosCount,
      sesiones: sesionesCount,
    };
  }

  // Eliminar un macrociclo (hard delete con cascade)
  // Las mesociclos, microciclos y sesiones se eliminan automaticamente por CASCADE
  @Transactional()
  async remove(id: string): Promise<{
    message: string;
    deleted: { mesociclos: number; microciclos: number; sesiones: number };
  }> {
    // Obtener conteos antes de eliminar
    const deleteInfo = await this.getDeleteInfo(id);

    // Eliminar (cascade elimina mesociclos -> microciclos -> sesiones)
    await this.prisma.macrociclo.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: `Macrociclo "${deleteInfo.nombre}" eliminado permanentemente`,
      deleted: {
        mesociclos: deleteInfo.mesociclos,
        microciclos: deleteInfo.microciclos,
        sesiones: deleteInfo.sesiones,
      },
    };
  }
}
