import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { CreateDolenciaDto, MarcarRecuperadoDto } from './dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class DolenciasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService
  ) {}

  // Crear una dolencia asociada a un registro post-entrenamiento
  @Transactional()
  async create(createDto: CreateDolenciaDto) {
    const registroId = BigInt(createDto.registroPostEntrenamientoId);

    // Verificar que el registro post-entrenamiento existe
    const registro = await this.prisma.registroPostEntrenamiento.findUnique({
      where: { id: registroId },
      select: {
        id: true,
        atletaId: true,
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro post-entrenamiento no encontrado');
    }

    // Crear la dolencia
    const dolencia = await this.prisma.dolencia.create({
      data: {
        registroPostEntrenamientoId: registroId,
        zona: createDto.zona,
        nivel: createDto.nivel,
        descripcion: createDto.descripcion || null,
        tipoLesion: createDto.tipoLesion || null,
      },
      include: {
        registroPostEntrenamiento: {
          select: {
            id: true,
            atletaId: true,
            fechaRegistro: true,
            atleta: {
              select: {
                id: true,
                usuario: {
                  select: {
                    nombreCompleto: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.formatResponse(dolencia);
  }

  // Listar dolencias con filtros
  async findAll(
    userId: bigint,
    userRole: RolUsuario,
    atletaId?: string,
    recuperado?: boolean,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // ENTRENADOR solo ve dolencias de sus atletas asignados
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.registroPostEntrenamiento = {
          atleta: {
            entrenadorAsignadoId: entrenadorId,
          },
        };
      }
    }

    // ATLETA solo ve sus propias dolencias
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      whereClause.registroPostEntrenamiento = {
        ...whereClause.registroPostEntrenamiento,
        atletaId: atletaIdFromUser,
      };
    }

    // Filtros adicionales
    if (atletaId) {
      // Si es ATLETA, validar que no intente ver dolencias de otro atleta
      if (userRole === RolUsuario.ATLETA) {
        const atletaIdFromUser = await this.accessControl.getAtletaId(userId);
        if (BigInt(atletaId) !== atletaIdFromUser) {
          throw new ForbiddenException('Solo puedes ver tus propias dolencias');
        }
      }

      whereClause.registroPostEntrenamiento = {
        ...whereClause.registroPostEntrenamiento,
        atletaId: BigInt(atletaId),
      };
    }

    if (recuperado !== undefined) {
      whereClause.recuperado = recuperado;
    }

    const [dolencias, total] = await Promise.all([
      this.prisma.dolencia.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ recuperado: 'asc' }, { createdAt: 'desc' }],
        include: {
          registroPostEntrenamiento: {
            include: {
              atleta: {
                include: {
                  usuario: { select: { nombreCompleto: true } },
                },
              },
              sesion: {
                select: {
                  fecha: true,
                  numeroSesion: true,
                },
              },
            },
          },
          entrenadorRecuperacion: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
        },
      }),
      this.prisma.dolencia.count({ where: whereClause }),
    ]);

    return {
      data: dolencias.map((d) => this.formatResponse(d)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener dolencias activas de un atleta
  async findActiveByAtleta(atletaId: string, userId: bigint, userRole: RolUsuario) {
    const whereClause: any = {
      recuperado: false,
      registroPostEntrenamiento: {
        atletaId: BigInt(atletaId),
      },
    };

    // ENTRENADOR solo ve dolencias de sus atletas
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.registroPostEntrenamiento.atleta = {
          entrenadorAsignadoId: entrenadorId,
        };
      }
    }

    // ATLETA solo ve sus propias dolencias activas
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (BigInt(atletaId) !== atletaIdFromUser) {
        throw new ForbiddenException('Solo puedes ver tus propias dolencias');
      }
    }

    const dolencias = await this.prisma.dolencia.findMany({
      where: whereClause,
      orderBy: { nivel: 'desc' }, // Ordenar por nivel de dolor (más alto primero)
      include: {
        registroPostEntrenamiento: {
          include: {
            sesion: {
              select: {
                fecha: true,
                numeroSesion: true,
              },
            },
          },
        },
      },
    });

    return dolencias.map((d) => this.formatResponse(d));
  }

  // Obtener una dolencia por ID
  async findOne(id: string, userId: bigint, userRole: RolUsuario) {
    const dolencia = await this.prisma.dolencia.findUnique({
      where: { id: BigInt(id) },
      include: {
        registroPostEntrenamiento: {
          include: {
            atleta: {
              include: {
                usuario: { select: { nombreCompleto: true, email: true } },
              },
            },
            sesion: {
              select: {
                fecha: true,
                numeroSesion: true,
              },
            },
          },
        },
        entrenadorRecuperacion: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    if (!dolencia) {
      throw new NotFoundException('Dolencia no encontrada');
    }

    // Verificar autorizacion si es ENTRENADOR
    if (userRole === RolUsuario.ENTRENADOR) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        userId,
        userRole,
        dolencia.registroPostEntrenamiento.atleta.id
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver esta dolencia');
      }
    }

    // Verificar autorizacion si es ATLETA
    if (userRole === RolUsuario.ATLETA) {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (dolencia.registroPostEntrenamiento.atleta.id !== atletaId) {
        throw new ForbiddenException('Solo puedes ver tus propias dolencias');
      }
    }

    return this.formatResponse(dolencia);
  }

  // Marcar dolencia como recuperada (transicion de estado)
  @Transactional()
  async marcarComoRecuperado(dolenciaId: string, userId: bigint, dto?: MarcarRecuperadoDto) {
    // 1. Buscar el entrenadorId usando el userId
    const entrenadorId = await this.accessControl.getEntrenadorId(userId);

    if (!entrenadorId) {
      throw new BadRequestException('No se encontró el registro de entrenador para este usuario');
    }

    // 2. Verificar que la dolencia existe
    const dolencia = await this.prisma.dolencia.findUnique({
      where: { id: BigInt(dolenciaId) },
      include: {
        registroPostEntrenamiento: {
          include: {
            atleta: {
              include: {
                usuario: { select: { id: true, nombreCompleto: true } },
              },
            },
          },
        },
      },
    });

    if (!dolencia) {
      throw new NotFoundException(`Dolencia con ID ${dolenciaId} no encontrada`);
    }

    // 2. Validar transicion de estado
    if (dolencia.recuperado) {
      throw new BadRequestException(
        `La dolencia ya fue marcada como recuperada el ${dolencia.fechaRecuperacion?.toISOString().split('T')[0]}`
      );
    }

    // 3. Ejecutar transicion de estado
    const dolenciaActualizada = await this.prisma.dolencia.update({
      where: { id: BigInt(dolenciaId) },
      data: {
        recuperado: true,
        fechaRecuperacion: new Date(),
        recuperadoPor: entrenadorId,
        // Agregar notas de recuperacion a la descripcion si se proporcionan
        descripcion: dto?.notasRecuperacion
          ? `${dolencia.descripcion || ''}\n[RECUPERACION - ${new Date().toISOString().split('T')[0]}]: ${dto.notasRecuperacion}`
          : dolencia.descripcion,
      },
      include: {
        registroPostEntrenamiento: {
          include: {
            atleta: {
              include: {
                usuario: { select: { nombreCompleto: true } },
              },
            },
            sesion: {
              select: {
                fecha: true,
                numeroSesion: true,
              },
            },
          },
        },
        entrenadorRecuperacion: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    // 4. Crear notificacion para el atleta
    await this.prisma.notificacion.create({
      data: {
        destinatarioId: dolencia.registroPostEntrenamiento.atleta.usuarioId,
        tipo: 'OTRO',
        titulo: 'Dolencia marcada como recuperada',
        mensaje: `Tu dolencia en ${dolencia.zona} (nivel ${dolencia.nivel}/10) ha sido marcada como recuperada por tu entrenador`,
        leida: false,
        prioridad: 'BAJA',
      },
    });

    return this.formatResponse(dolenciaActualizada);
  }

  // Metodo auxiliar para formatear respuesta
  private formatResponse(dolencia: any) {
    return {
      id: dolencia.id.toString(),
      registroPostEntrenamientoId: dolencia.registroPostEntrenamientoId.toString(),
      zona: dolencia.zona,
      nivel: dolencia.nivel,
      descripcion: dolencia.descripcion,
      tipoLesion: dolencia.tipoLesion,
      recuperado: dolencia.recuperado,
      fechaRecuperacion: dolencia.fechaRecuperacion,
      recuperadoPor: dolencia.recuperadoPor ? dolencia.recuperadoPor.toString() : null,
      createdAt: dolencia.createdAt,
      updatedAt: dolencia.updatedAt,
      ...(dolencia.registroPostEntrenamiento && {
        registroPostEntrenamiento: {
          id: dolencia.registroPostEntrenamiento.id.toString(),
          fechaRegistro: dolencia.registroPostEntrenamiento.fechaRegistro,
          ...(dolencia.registroPostEntrenamiento.atleta && {
            atleta: {
              id: dolencia.registroPostEntrenamiento.atleta.id.toString(),
              nombreCompleto: dolencia.registroPostEntrenamiento.atleta.usuario?.nombreCompleto,
            },
          }),
          ...(dolencia.registroPostEntrenamiento.sesion && {
            sesion: {
              fecha: dolencia.registroPostEntrenamiento.sesion.fecha,
              numeroSesion: dolencia.registroPostEntrenamiento.sesion.numeroSesion,
            },
          }),
        },
      }),
      ...(dolencia.entrenadorRecuperacion && {
        entrenadorRecuperacion: {
          id: dolencia.entrenadorRecuperacion.id.toString(),
          nombreCompleto: dolencia.entrenadorRecuperacion.usuario?.nombreCompleto,
        },
      }),
    };
  }
}
