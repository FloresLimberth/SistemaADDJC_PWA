import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../../database/prisma.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { CreateMesocicloDto, UpdateMesocicloDto, MesocicloResponseDto } from '../dto';
import { DateRangeValidator } from '../validators/date-range.validator';

@Injectable()
export class MesociclosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    private readonly dateRangeValidator: DateRangeValidator
  ) {}

  // Crear un nuevo mesociclo
  @Transactional()
  async create(createMesocicloDto: CreateMesocicloDto): Promise<MesocicloResponseDto> {
    const fechaInicio = new Date(createMesocicloDto.fechaInicio);
    const fechaFin = new Date(createMesocicloDto.fechaFin);

    // Validar que fechaFin > fechaInicio
    this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'mesociclo');

    const macrocicloId = BigInt(createMesocicloDto.macrocicloId);

    // Validar que las fechas del mesociclo estén dentro del rango del macrociclo
    await this.dateRangeValidator.validateMesocicloInMacrociclo(
      macrocicloId,
      fechaInicio,
      fechaFin
    );

    // Crear mesociclo
    const mesociclo = await this.prisma.mesociclo.create({
      data: {
        macrocicloId,
        nombre: createMesocicloDto.nombre,
        codigoMesociclo: createMesocicloDto.codigoMesociclo,
        etapa: createMesocicloDto.etapa,
        fechaInicio,
        fechaFin,
        objetivoFisico: createMesocicloDto.objetivoFisico,
        objetivoTecnico: createMesocicloDto.objetivoTecnico,
        objetivoTactico: createMesocicloDto.objetivoTactico,
      },
      select: {
        id: true,
        macrocicloId: true,
        nombre: true,
        codigoMesociclo: true,
        etapa: true,
        fechaInicio: true,
        fechaFin: true,
        objetivoFisico: true,
        objetivoTecnico: true,
        objetivoTactico: true,
        createdAt: true,
        updatedAt: true,
        macrociclo: {
          select: {
            id: true,
            nombre: true,
            temporada: true,
          },
        },
      },
    });

    return mesociclo;
  }

  // Listar mesociclos con filtros opcionales
  async findAll(userId: bigint, rol: string, macrocicloId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (macrocicloId) {
      where.macrocicloId = BigInt(macrocicloId);
    }

    // Si es ENTRENADOR, usar nested filter de Prisma (4 queries → 1 query)
    if (rol === 'ENTRENADOR') {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (!entrenadorId) {
        throw new NotFoundException('Entrenador no encontrado');
      }

      // Usar nested filter para filtrar mesociclos que tienen microciclos con atletas del entrenador
      where.microciclos = {
        some: {
          asignacionesAtletas: {
            some: {
              atleta: {
                entrenadorAsignadoId: entrenadorId,
              },
            },
          },
        },
      };
    }

    // Si es ATLETA, usar nested filter de Prisma (3 queries → 1 query)
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Usar nested filter para filtrar mesociclos que tienen microciclos asignados al atleta
      where.microciclos = {
        some: {
          asignacionesAtletas: {
            some: {
              atletaId,
            },
          },
        },
      };
    }

    const [mesociclos, total] = await Promise.all([
      this.prisma.mesociclo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigoMesociclo: 'asc' },
        select: {
          id: true,
          macrocicloId: true,
          nombre: true,
          codigoMesociclo: true,
          etapa: true,
          fechaInicio: true,
          fechaFin: true,
          objetivoFisico: true,
          objetivoTecnico: true,
          objetivoTactico: true,
          createdAt: true,
          updatedAt: true,
          macrociclo: {
            select: {
              id: true,
              nombre: true,
              temporada: true,
            },
          },
        },
      }),
      this.prisma.mesociclo.count({ where }),
    ]);

    return {
      data: mesociclos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un mesociclo por ID (con validacion de ownership para ENTRENADOR)
  async findOne(id: string, userId: bigint, rol: string): Promise<MesocicloResponseDto> {
    const mesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        macrocicloId: true,
        nombre: true,
        codigoMesociclo: true,
        etapa: true,
        fechaInicio: true,
        fechaFin: true,
        objetivoFisico: true,
        objetivoTecnico: true,
        objetivoTactico: true,
        createdAt: true,
        updatedAt: true,
        macrociclo: {
          select: {
            id: true,
            nombre: true,
            temporada: true,
          },
        },
      },
    });

    if (!mesociclo) {
      throw new NotFoundException('Mesociclo no encontrado');
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
            mesocicloId: mesociclo.id,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Mesociclo no encontrado o no autorizado');
      }
    }

    // Si es ATLETA, validar usando nested filter (ya optimizado)
    if (rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('Atleta no encontrado');
      }

      // Verificar si el atleta esta asignado a algun microciclo de este mesociclo
      const asignacion = await this.prisma.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId,
          microciclo: {
            mesocicloId: mesociclo.id,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Mesociclo no encontrado o no autorizado');
      }
    }

    return mesociclo;
  }

  // Actualizar un mesociclo
  @Transactional()
  async update(id: string, updateMesocicloDto: UpdateMesocicloDto): Promise<MesocicloResponseDto> {
    // Verificar que existe
    const existingMesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingMesociclo) {
      throw new NotFoundException('Mesociclo no encontrado');
    }

    // Validar fechas si se actualizan
    if (updateMesocicloDto.fechaInicio || updateMesocicloDto.fechaFin) {
      const fechaInicio = updateMesocicloDto.fechaInicio
        ? new Date(updateMesocicloDto.fechaInicio)
        : existingMesociclo.fechaInicio;

      const fechaFin = updateMesocicloDto.fechaFin
        ? new Date(updateMesocicloDto.fechaFin)
        : existingMesociclo.fechaFin;

      // Validar que fechaFin > fechaInicio
      this.dateRangeValidator.validateDateOrder(fechaInicio, fechaFin, 'mesociclo');

      // Validar que las fechas están dentro del rango del macrociclo
      await this.dateRangeValidator.validateMesocicloInMacrociclo(
        existingMesociclo.macrocicloId,
        fechaInicio,
        fechaFin
      );
    }

    // Actualizar
    const mesociclo = await this.prisma.mesociclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateMesocicloDto.nombre && { nombre: updateMesocicloDto.nombre }),
        ...(updateMesocicloDto.codigoMesociclo && {
          codigoMesociclo: updateMesocicloDto.codigoMesociclo,
        }),
        ...(updateMesocicloDto.etapa && { etapa: updateMesocicloDto.etapa }),
        ...(updateMesocicloDto.fechaInicio && {
          fechaInicio: new Date(updateMesocicloDto.fechaInicio),
        }),
        ...(updateMesocicloDto.fechaFin && { fechaFin: new Date(updateMesocicloDto.fechaFin) }),
        ...(updateMesocicloDto.objetivoFisico && {
          objetivoFisico: updateMesocicloDto.objetivoFisico,
        }),
        ...(updateMesocicloDto.objetivoTecnico && {
          objetivoTecnico: updateMesocicloDto.objetivoTecnico,
        }),
        ...(updateMesocicloDto.objetivoTactico && {
          objetivoTactico: updateMesocicloDto.objetivoTactico,
        }),
      },
      select: {
        id: true,
        macrocicloId: true,
        nombre: true,
        codigoMesociclo: true,
        etapa: true,
        fechaInicio: true,
        fechaFin: true,
        objetivoFisico: true,
        objetivoTecnico: true,
        objetivoTactico: true,
        createdAt: true,
        updatedAt: true,
        macrociclo: {
          select: {
            id: true,
            nombre: true,
            temporada: true,
          },
        },
      },
    });

    return mesociclo;
  }

  // Obtener informacion de eliminacion (conteo de registros hijos)
  // Usado por el frontend para mostrar advertencia antes de eliminar
  async getDeleteInfo(id: string): Promise<{
    nombre: string;
    microciclos: number;
    sesiones: number;
  }> {
    const mesociclo = await this.prisma.mesociclo.findUnique({
      where: { id: BigInt(id) },
      select: {
        nombre: true,
        microciclos: {
          select: {
            id: true,
            _count: {
              select: { sesiones: true },
            },
          },
        },
      },
    });

    if (!mesociclo) {
      throw new NotFoundException('Mesociclo no encontrado');
    }

    // Calcular totales
    const microciclosCount = mesociclo.microciclos.length;
    let sesionesCount = 0;

    for (const microciclo of mesociclo.microciclos) {
      sesionesCount += microciclo._count.sesiones;
    }

    return {
      nombre: mesociclo.nombre,
      microciclos: microciclosCount,
      sesiones: sesionesCount,
    };
  }

  // Eliminar un mesociclo (hard delete con cascade)
  // Los microciclos y sesiones se eliminan automaticamente por CASCADE
  @Transactional()
  async remove(
    id: string
  ): Promise<{ message: string; deleted: { microciclos: number; sesiones: number } }> {
    // Obtener conteos antes de eliminar
    const deleteInfo = await this.getDeleteInfo(id);

    // Eliminar (cascade elimina microciclos -> sesiones)
    await this.prisma.mesociclo.delete({
      where: { id: BigInt(id) },
    });

    return {
      message: `Mesociclo "${deleteInfo.nombre}" eliminado permanentemente`,
      deleted: {
        microciclos: deleteInfo.microciclos,
        sesiones: deleteInfo.sesiones,
      },
    };
  }
}
