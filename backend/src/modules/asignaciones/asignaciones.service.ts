import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../database/prisma.service';
import { CreateAsignacionDto, UpdateAsignacionDto } from './dto';

@Injectable()
export class AsignacionesService {
  constructor(private readonly prisma: PrismaService) {}

  // Crear una asignacion de atleta a microciclo
  @Transactional()
  async create(createDto: CreateAsignacionDto, asignadoPorUserId: bigint) {
    const atletaId = BigInt(createDto.atletaId);
    const microcicloId = BigInt(createDto.microcicloId);

    // Verificar que el atleta existe
    const atleta = await this.prisma.atleta.findUnique({
      where: { id: atletaId },
      select: {
        id: true,
        usuario: { select: { nombreCompleto: true } },
      },
    });

    if (!atleta) {
      throw new NotFoundException('Atleta no encontrado');
    }

    // Verificar que el microciclo existe
    const microciclo = await this.prisma.microciclo.findUnique({
      where: { id: microcicloId },
      select: {
        id: true,
        codigoMicrociclo: true,
        fechaInicio: true,
        fechaFin: true,
      },
    });

    if (!microciclo) {
      throw new NotFoundException('Microciclo no encontrado');
    }

    // Verificar que no existe asignacion duplicada
    const asignacionExistente = await this.prisma.asignacionAtletaMicrociclo.findFirst({
      where: {
        atletaId,
        microcicloId,
      },
    });

    if (asignacionExistente) {
      throw new ConflictException(
        `El atleta ya esta asignado al microciclo ${microciclo.codigoMicrociclo}`
      );
    }

    // Crear la asignacion
    const asignacion = await this.prisma.asignacionAtletaMicrociclo.create({
      data: {
        atletaId,
        microcicloId,
        asignadoPor: asignadoPorUserId,
        observaciones: createDto.observaciones || null,
      },
      include: {
        atleta: {
          select: {
            id: true,
            usuario: { select: { nombreCompleto: true } },
          },
        },
        microciclo: {
          select: {
            id: true,
            codigoMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
        asignador: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
      },
    });

    return this.formatResponse(asignacion);
  }

  // Listar asignaciones con filtros
  async findAll(atletaId?: string, microcicloId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (atletaId) {
      where.atletaId = BigInt(atletaId);
    }

    if (microcicloId) {
      where.microcicloId = BigInt(microcicloId);
    }

    const [asignaciones, total] = await Promise.all([
      this.prisma.asignacionAtletaMicrociclo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaAsignacion: 'desc' },
        include: {
          atleta: {
            select: {
              id: true,
              usuario: { select: { nombreCompleto: true } },
            },
          },
          microciclo: {
            select: {
              id: true,
              codigoMicrociclo: true,
              fechaInicio: true,
              fechaFin: true,
            },
          },
          asignador: {
            select: {
              id: true,
              nombreCompleto: true,
            },
          },
        },
      }),
      this.prisma.asignacionAtletaMicrociclo.count({ where }),
    ]);

    return {
      data: asignaciones.map((a) => this.formatResponse(a)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener una asignacion por ID
  async findOne(id: string) {
    const asignacion = await this.prisma.asignacionAtletaMicrociclo.findUnique({
      where: { id: BigInt(id) },
      include: {
        atleta: {
          select: {
            id: true,
            usuario: { select: { nombreCompleto: true } },
          },
        },
        microciclo: {
          select: {
            id: true,
            codigoMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
        asignador: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignacion no encontrada');
    }

    return this.formatResponse(asignacion);
  }

  // Actualizar una asignacion
  @Transactional()
  async update(id: string, updateDto: UpdateAsignacionDto) {
    const asignacionExistente = await this.prisma.asignacionAtletaMicrociclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!asignacionExistente) {
      throw new NotFoundException('Asignacion no encontrada');
    }

    const asignacion = await this.prisma.asignacionAtletaMicrociclo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDto.observaciones !== undefined && {
          observaciones: updateDto.observaciones,
        }),
      },
      include: {
        atleta: {
          select: {
            id: true,
            usuario: { select: { nombreCompleto: true } },
          },
        },
        microciclo: {
          select: {
            id: true,
            codigoMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
        asignador: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
      },
    });

    return this.formatResponse(asignacion);
  }

  // Eliminar una asignacion permanentemente (hard delete)
  @Transactional()
  async remove(id: string) {
    const asignacion = await this.prisma.asignacionAtletaMicrociclo.findUnique({
      where: { id: BigInt(id) },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignacion no encontrada');
    }

    // Eliminar permanentemente (hard delete)
    await this.prisma.asignacionAtletaMicrociclo.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Asignacion eliminada permanentemente' };
  }

  // Metodo auxiliar para formatear respuesta
  private formatResponse(asignacion: any) {
    return {
      id: asignacion.id.toString(),
      atletaId: asignacion.atletaId.toString(),
      microcicloId: asignacion.microcicloId.toString(),
      asignadoPor: asignacion.asignadoPor.toString(),
      fechaAsignacion: asignacion.fechaAsignacion,
      observaciones: asignacion.observaciones,
      createdAt: asignacion.createdAt,
      updatedAt: asignacion.updatedAt,
      ...(asignacion.atleta && {
        atleta: {
          id: asignacion.atleta.id.toString(),
          nombreCompleto: asignacion.atleta.usuario?.nombreCompleto,
        },
      }),
      ...(asignacion.microciclo && {
        microciclo: {
          id: asignacion.microciclo.id.toString(),
          codigoMicrociclo: asignacion.microciclo.codigoMicrociclo,
          fechaInicio: asignacion.microciclo.fechaInicio,
          fechaFin: asignacion.microciclo.fechaFin,
        },
      }),
      ...(asignacion.asignador && {
        asignador: {
          id: asignacion.asignador.id.toString(),
          nombreCompleto: asignacion.asignador.nombreCompleto,
        },
      }),
    };
  }
}
