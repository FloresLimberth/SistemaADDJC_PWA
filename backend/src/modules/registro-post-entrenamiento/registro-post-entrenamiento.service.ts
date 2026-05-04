import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { CreateRegistroPostEntrenamientoDto } from './dto';
import { RolUsuario, TipoRecomendacion, Prioridad, EstadoRecomendacion } from '@prisma/client';
import { AlertasSistemaService } from '../algoritmo/services/alertas-sistema.service';
import {
  AnalisisRendimientoService,
  CONFIGURACION_ANALISIS,
} from '../algoritmo/services/analisis-rendimiento.service';
import { evaluarReglas, ContextoEvaluacion } from '../algoritmo/reglas';

@Injectable()
export class RegistroPostEntrenamientoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
    @Inject(forwardRef(() => AlertasSistemaService))
    private readonly alertasService: AlertasSistemaService,
    @Inject(forwardRef(() => AnalisisRendimientoService))
    private readonly analisisService: AnalisisRendimientoService
  ) {}

  // Crear registro post-entrenamiento con validacion 1:1
  @Transactional()
  async create(dto: CreateRegistroPostEntrenamientoDto, userId: bigint) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Buscar el entrenadorId usando el userId
      const entrenador = await tx.entrenador.findUnique({
        where: { usuarioId: userId },
        select: { id: true },
      });

      if (!entrenador) {
        throw new BadRequestException('No se encontró el registro de entrenador para este usuario');
      }

      const entrenadorRegistroId = entrenador.id;
      const atletaId = BigInt(dto.atletaId);
      const sesionId = BigInt(dto.sesionId);

      // 1. Verificar que la sesion existe
      const sesion = await tx.sesion.findUnique({
        where: { id: sesionId },
        select: {
          id: true,
          tipoSesion: true,
          microciclo: {
            select: {
              id: true,
              codigoMicrociclo: true,
              fechaInicio: true,
              fechaFin: true,
            },
          },
        },
      });

      if (!sesion) {
        throw new NotFoundException(`La sesion con ID ${sesionId} no existe`);
      }

      // Validar que la sesion sea de tipo ENTRENAMIENTO, RECUPERACION o COMPETENCIA
      const tiposPermitidos = ['ENTRENAMIENTO', 'RECUPERACION', 'COMPETENCIA'];
      if (!tiposPermitidos.includes(sesion.tipoSesion)) {
        throw new BadRequestException(
          `Solo se pueden registrar post-entrenamientos en sesiones de tipo ENTRENAMIENTO, RECUPERACION o COMPETENCIA. La sesion ${sesionId} es de tipo ${sesion.tipoSesion}`
        );
      }

      // Validar campos requeridos segun tipo de sesion
      // Para COMPETENCIA: solo asistio, motivoInasistencia, dolencias, observaciones
      // Para ENTRENAMIENTO/RECUPERACION: todos los campos de entrenamiento son requeridos
      const esCompetencia = sesion.tipoSesion === 'COMPETENCIA';

      // Validar rendimiento por ejercicio obligatorio (asistio=true y NO competencia)
      if (!esCompetencia && dto.asistio) {
        // Verificar que la sesion tiene ejercicios asignados
        const cantidadEjercicios = await tx.ejercicioSesion.count({
          where: { sesionId: sesionId },
        });

        if (cantidadEjercicios === 0) {
          throw new BadRequestException(
            'Esta sesion no tiene ejercicios asignados. No se puede registrar rendimiento por ejercicio.'
          );
        }

        // Validar que se enviaron rendimientos
        if (!dto.rendimientosEjercicios || dto.rendimientosEjercicios.length === 0) {
          throw new BadRequestException(
            'Debe registrar el rendimiento de al menos 1 ejercicio para sesiones de entrenamiento/recuperacion'
          );
        }
      }

      if (!esCompetencia && dto.asistio) {
        // Si asistio y NO es competencia, validar campos de entrenamiento
        if (dto.ejerciciosCompletados === undefined || dto.ejerciciosCompletados === null) {
          throw new BadRequestException(
            'ejerciciosCompletados es requerido para sesiones de entrenamiento'
          );
        }
        if (dto.intensidadAlcanzada === undefined || dto.intensidadAlcanzada === null) {
          throw new BadRequestException(
            'intensidadAlcanzada es requerido para sesiones de entrenamiento'
          );
        }
        if (dto.duracionReal === undefined || dto.duracionReal === null) {
          throw new BadRequestException('duracionReal es requerido para sesiones de entrenamiento');
        }
        if (dto.rpe === undefined || dto.rpe === null) {
          throw new BadRequestException('rpe es requerido para sesiones de entrenamiento');
        }
        if (dto.calidadSueno === undefined || dto.calidadSueno === null) {
          throw new BadRequestException('calidadSueno es requerido para sesiones de entrenamiento');
        }
        if (dto.estadoAnimico === undefined || dto.estadoAnimico === null) {
          throw new BadRequestException(
            'estadoAnimico es requerido para sesiones de entrenamiento'
          );
        }
      }

      // 2. Validar que el atleta existe
      const atleta = await tx.atleta.findUnique({
        where: { id: atletaId },
        include: {
          usuario: {
            select: { nombreCompleto: true, email: true },
          },
        },
      });

      if (!atleta) {
        throw new NotFoundException(`El atleta con ID ${atletaId} no existe`);
      }

      // 3. Validar que el atleta esta asignado al microciclo de la sesion
      const asignacion = await tx.asignacionAtletaMicrociclo.findFirst({
        where: {
          atletaId: atletaId,
          microcicloId: sesion.microciclo?.id,
        },
      });

      if (!asignacion) {
        throw new BadRequestException(
          `El atleta ${atleta.usuario.nombreCompleto} no esta asignado al microciclo ${sesion.microciclo?.codigoMicrociclo || 'desconocido'} de esta sesion`
        );
      }

      // 4. Validar relacion 1:1 - solo un registro por sesion/atleta
      const registroExistente = await tx.registroPostEntrenamiento.findFirst({
        where: {
          sesionId: sesionId,
          atletaId: atletaId,
        },
      });

      if (registroExistente) {
        throw new ConflictException(
          `Ya existe un registro post-entrenamiento para el atleta ${atleta.usuario.nombreCompleto} en la sesion ${sesionId}`
        );
      }

      // 5. Crear el registro con dolencias anidadas (si existen)
      // Para COMPETENCIA: usar valores por defecto en campos de entrenamiento
      const registro = await tx.registroPostEntrenamiento.create({
        data: {
          atletaId,
          sesionId,
          entrenadorRegistroId,
          asistio: dto.asistio,
          motivoInasistencia: dto.motivoInasistencia,
          // Campos de entrenamiento: usar valores del DTO o valores por defecto para COMPETENCIA
          // Para COMPETENCIA: usar valores minimos validos (CHECK constraints requieren >= 1)
          // Para ENTRENAMIENTO/RECUPERACION: ya validamos que existen
          ejerciciosCompletados: esCompetencia
            ? (dto.ejerciciosCompletados ?? 0)
            : (dto.ejerciciosCompletados ?? 0),
          intensidadAlcanzada: esCompetencia
            ? (dto.intensidadAlcanzada ?? 0)
            : (dto.intensidadAlcanzada ?? 0),
          duracionReal: esCompetencia ? (dto.duracionReal ?? 1) : (dto.duracionReal ?? 1),
          rpe: esCompetencia ? (dto.rpe ?? 1) : (dto.rpe ?? 1),
          calidadSueno: esCompetencia ? (dto.calidadSueno ?? 1) : (dto.calidadSueno ?? 1),
          horasSueno: dto.horasSueno,
          estadoAnimico: esCompetencia ? (dto.estadoAnimico ?? 1) : (dto.estadoAnimico ?? 1),
          observaciones: dto.observaciones,
          // Crear dolencias anidadas si existen
          dolencias: dto.dolencias
            ? {
                create: dto.dolencias.map((dolencia) => ({
                  zona: dolencia.zona,
                  nivel: dolencia.nivel,
                  descripcion: dolencia.descripcion,
                  tipoLesion: dolencia.tipoLesion,
                })),
              }
            : undefined,
        },
        include: {
          atleta: {
            include: {
              usuario: {
                select: { nombreCompleto: true, email: true },
              },
            },
          },
          sesion: {
            select: {
              id: true,
              fecha: true,
              numeroSesion: true,
              tipoSesion: true,
              microciclo: {
                select: {
                  codigoMicrociclo: true,
                },
              },
            },
          },
          entrenador: {
            include: {
              usuario: {
                select: { nombreCompleto: true },
              },
            },
          },
          dolencias: true,
        },
      });

      // 5.1 Guardar rendimientos por ejercicio
      // Obligatorio para sesiones de entrenamiento/recuperacion cuando asistio=true
      let rendimientosGuardados = 0;
      if (dto.rendimientosEjercicios && dto.rendimientosEjercicios.length > 0) {
        // Validar que los ejercicioSesionId pertenecen a la sesion
        const ejerciciosSesionIds = dto.rendimientosEjercicios.map((r) =>
          BigInt(r.ejercicioSesionId)
        );

        const ejerciciosValidos = await tx.ejercicioSesion.findMany({
          where: {
            id: { in: ejerciciosSesionIds },
            sesionId: sesionId,
          },
          select: { id: true },
        });

        const idsValidos = new Set(ejerciciosValidos.map((e) => e.id.toString()));

        // Crear rendimientos solo para ejercicios validos
        const rendimientosData = dto.rendimientosEjercicios
          .filter((r) => idsValidos.has(BigInt(r.ejercicioSesionId).toString()))
          .map((r) => ({
            registroPostEntrenamientoId: registro.id,
            ejercicioSesionId: BigInt(r.ejercicioSesionId),
            completado: r.completado,
            rendimiento: r.rendimiento,
            dificultadPercibida: r.dificultadPercibida,
            tiempoReal: r.tiempoReal,
            observacion: r.observacion,
            motivoNoCompletado: r.motivoNoCompletado,
          }));

        if (rendimientosData.length > 0) {
          await tx.rendimientoEjercicio.createMany({
            data: rendimientosData,
          });
          rendimientosGuardados = rendimientosData.length;
        }
      }

      // 6. Formatear respuesta con BigInt convertidos a string
      return {
        registro,
        atletaId,
        sesionId,
        rendimientosGuardados,
      };
    });

    // 7. Procesar alertas automaticas (fuera de la transaccion)
    // Esto evalua reglas de fatiga, lesion, peso, etc.
    let alertasGeneradas = null;
    try {
      if (dto.asistio) {
        alertasGeneradas = await this.alertasService.procesarAlertasPostEntrenamiento(
          result.atletaId,
          result.registro.id,
          result.sesionId
        );
      }
    } catch (error) {
      // Log del error pero no fallamos la creacion del registro
      console.error('Error procesando alertas:', error);
    }

    // 8. Generar recomendaciones automaticas basadas en analisis de rendimiento
    // Solo si el atleta asistio y hay suficientes datos historicos
    const recomendacionesGeneradas: any[] = [];
    try {
      if (dto.asistio) {
        // Ejecutar analisis de rendimiento del atleta
        const analisis = await this.analisisService.analizarRendimientoAtleta(
          result.atletaId,
          30 // Ultimos 30 dias
        );

        // Solo generar recomendaciones si hay suficientes datos
        if (
          analisis.resumenGeneral.totalRegistros >= CONFIGURACION_ANALISIS.MINIMO_REGISTROS_ANALISIS
        ) {
          // Evaluar reglas para generar recomendaciones
          const contexto: ContextoEvaluacion = {
            atletaId: result.atletaId,
            nombreAtleta: analisis.nombreAtleta,
            rendimientoPorTipo: analisis.rendimientoPorTipo,
            ejerciciosProblematicos: analisis.ejerciciosProblematicos,
            diasAnalizados: analisis.periodoAnalisis.diasAnalizados,
          };

          const recomendacionesEvaluadas = evaluarReglas(contexto);

          // Si hay recomendaciones, guardarlas en la base de datos
          if (recomendacionesEvaluadas.length > 0) {
            // Crear recomendaciones en la base de datos
            for (const rec of recomendacionesEvaluadas) {
              const recomendacion = await this.prisma.recomendacion.create({
                data: {
                  atletaId: result.atletaId,
                  tipo: rec.tipoRecomendacion as TipoRecomendacion,
                  prioridad: rec.prioridad as Prioridad,
                  titulo: `[${rec.reglaId}] ${rec.titulo}`,
                  mensaje: rec.mensaje,
                  accionSugerida: rec.accionSugerida,
                  datosAnalisis: rec.datosAnalisis as object,
                  estado: EstadoRecomendacion.PENDIENTE,
                },
              });

              recomendacionesGeneradas.push({
                id: recomendacion.id.toString(),
                tipo: rec.tipoRecomendacion,
                prioridad: rec.prioridad,
                titulo: rec.titulo,
                mensaje: rec.mensaje,
                accionSugerida: rec.accionSugerida,
              });
            }

            // Notificar al COMITE_TECNICO sobre las nuevas recomendaciones
            const miembrosComite = await this.prisma.usuario.findMany({
              where: { rol: RolUsuario.COMITE_TECNICO, estado: true },
              select: { id: true },
            });

            // Crear notificaciones para cada miembro del comite
            if (miembrosComite.length > 0) {
              await this.prisma.notificacion.createMany({
                data: miembrosComite.map((miembro) => ({
                  destinatarioId: miembro.id,
                  tipo: 'RECOMENDACION_ALGORITMO',
                  titulo: `Nuevas recomendaciones para ${analisis.nombreAtleta}`,
                  mensaje: `El sistema ha generado ${recomendacionesGeneradas.length} recomendacion(es) basadas en el analisis de rendimiento del atleta.`,
                  prioridad: recomendacionesGeneradas.some((r) => r.prioridad === 'CRITICA')
                    ? 'CRITICA'
                    : recomendacionesGeneradas.some((r) => r.prioridad === 'ALTA')
                      ? 'ALTA'
                      : 'MEDIA',
                })),
              });
            }
          }
        }
      }
    } catch (error) {
      // Log del error pero no fallamos la creacion del registro
      console.error('Error generando recomendaciones automaticas:', error);
    }

    return {
      ...this.formatResponse(result.registro),
      alertas: alertasGeneradas,
      rendimientosEjerciciosGuardados: result.rendimientosGuardados,
      recomendacionesGeneradas:
        recomendacionesGeneradas.length > 0 ? recomendacionesGeneradas : null,
    };
  }

  // Listar registros con filtros
  async findAll(
    userId: bigint,
    userRole: RolUsuario,
    atletaId?: string,
    sesionId?: string,
    page = 1,
    limit = 10,
    fechaDesde?: string,
    fechaHasta?: string,
    asistio?: string,
    rpeMin?: number
  ) {
    const skip = (page - 1) * limit;

    // Filtrar por rol
    const whereClause: any = {};

    // COMITE_TECNICO puede ver todos los registros
    // ENTRENADOR solo ve registros de sus atletas asignados
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.atleta = {
          entrenadorAsignadoId: entrenadorId,
        };
      }
    }

    // ATLETA solo ve sus propios registros
    if (userRole === RolUsuario.ATLETA) {
      const atletaIdFromUser = await this.accessControl.getAtletaId(userId);

      if (!atletaIdFromUser) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      whereClause.atletaId = atletaIdFromUser;
    }

    // Filtros adicionales
    if (atletaId) {
      // Si es ATLETA, validar que no intente ver registros de otro atleta
      if (userRole === RolUsuario.ATLETA) {
        const atletaIdFromUser = await this.accessControl.getAtletaId(userId);
        if (BigInt(atletaId) !== atletaIdFromUser) {
          throw new ForbiddenException('Solo puedes ver tus propios registros');
        }
      }
      whereClause.atletaId = BigInt(atletaId);
    }
    if (sesionId) {
      whereClause.sesionId = BigInt(sesionId);
    }

    // Filtro por rango de fechas (campo: fechaRegistro)
    if (fechaDesde || fechaHasta) {
      whereClause.fechaRegistro = {};
      if (fechaDesde) {
        whereClause.fechaRegistro.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        // Incluir todo el dia de fechaHasta (hasta las 23:59:59)
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        whereClause.fechaRegistro.lte = hasta;
      }
    }

    // Filtro por asistencia (campo: asistio)
    if (asistio === 'true' || asistio === 'false') {
      whereClause.asistio = asistio === 'true';
    }

    // Filtro por RPE minimo (campo: rpe)
    if (rpeMin !== undefined && rpeMin >= 1 && rpeMin <= 10) {
      whereClause.rpe = { gte: rpeMin };
    }

    const [registros, total] = await Promise.all([
      this.prisma.registroPostEntrenamiento.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { fechaRegistro: 'desc' },
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
          sesion: {
            select: {
              id: true,
              fecha: true,
              numeroSesion: true,
              tipoSesion: true,
            },
          },
          dolencias: {
            where: { recuperado: false }, // Solo dolencias activas
          },
        },
      }),
      this.prisma.registroPostEntrenamiento.count({ where: whereClause }),
    ]);

    return {
      data: registros.map((r) => this.formatResponse(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un registro por ID
  async findOne(id: string, userId: bigint, userRole: RolUsuario) {
    const registro = await this.prisma.registroPostEntrenamiento.findUnique({
      where: { id: BigInt(id) },
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true, email: true } },
          },
        },
        sesion: {
          include: {
            microciclo: {
              select: {
                codigoMicrociclo: true,
                fechaInicio: true,
                fechaFin: true,
              },
            },
          },
        },
        entrenador: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        dolencias: true,
      },
    });

    if (!registro) {
      throw new NotFoundException('Registro post-entrenamiento no encontrado');
    }

    // Verificar autorizacion si es ENTRENADOR
    if (userRole === RolUsuario.ENTRENADOR) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        userId,
        userRole,
        registro.atleta.id
      );

      if (!hasAccess) {
        throw new ForbiddenException('No tienes permiso para ver este registro');
      }
    }

    // Verificar autorizacion si es ATLETA
    if (userRole === RolUsuario.ATLETA) {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      if (registro.atleta.id !== atletaId) {
        throw new ForbiddenException('Solo puedes ver tus propios registros');
      }
    }

    return this.formatResponse(registro);
  }

  // Obtener registro de una sesion especifica
  async findBySesion(sesionId: string, userId: bigint, userRole: RolUsuario) {
    const whereClause: any = {
      sesionId: BigInt(sesionId),
    };

    // ENTRENADOR solo ve registros de sus atletas
    if (userRole === RolUsuario.ENTRENADOR) {
      const entrenadorId = await this.accessControl.getEntrenadorId(userId);

      if (entrenadorId) {
        whereClause.atleta = {
          entrenadorAsignadoId: entrenadorId,
        };
      }
    }

    // ATLETA solo ve sus propios registros
    if (userRole === RolUsuario.ATLETA) {
      const atletaId = await this.accessControl.getAtletaId(userId);

      if (!atletaId) {
        throw new NotFoundException('No se encontro el perfil de atleta para este usuario');
      }

      whereClause.atletaId = atletaId;
    }

    const registros = await this.prisma.registroPostEntrenamiento.findMany({
      where: whereClause,
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        dolencias: true,
      },
    });

    return registros.map((r) => this.formatResponse(r));
  }

  // Metodo auxiliar para formatear respuesta con BigInt a string y Decimal a number
  private formatResponse(registro: any) {
    return {
      id: registro.id.toString(),
      atletaId: registro.atletaId.toString(),
      sesionId: registro.sesionId.toString(),
      entrenadorRegistroId: registro.entrenadorRegistroId.toString(),
      fechaRegistro: registro.fechaRegistro,
      asistio: registro.asistio,
      motivoInasistencia: registro.motivoInasistencia,
      ejerciciosCompletados: parseFloat(registro.ejerciciosCompletados.toString()),
      intensidadAlcanzada: parseFloat(registro.intensidadAlcanzada.toString()),
      duracionReal: registro.duracionReal,
      rpe: registro.rpe,
      calidadSueno: registro.calidadSueno,
      horasSueno: registro.horasSueno ? parseFloat(registro.horasSueno.toString()) : null,
      estadoAnimico: registro.estadoAnimico,
      observaciones: registro.observaciones,
      createdAt: registro.createdAt,
      updatedAt: registro.updatedAt,
      ...(registro.atleta && {
        atleta: {
          id: registro.atleta.id.toString(),
          nombreCompleto: registro.atleta.usuario?.nombreCompleto,
        },
      }),
      ...(registro.sesion && {
        sesion: {
          id: registro.sesion.id.toString(),
          fecha: registro.sesion.fecha,
          numeroSesion: registro.sesion.numeroSesion,
          tipoSesion: registro.sesion.tipoSesion,
          ...(registro.sesion.microciclo && {
            microciclo: {
              codigoMicrociclo: registro.sesion.microciclo.codigoMicrociclo,
            },
          }),
        },
      }),
      ...(registro.entrenador && {
        entrenador: {
          id: registro.entrenador.id.toString(),
          nombreCompleto: registro.entrenador.usuario?.nombreCompleto,
        },
      }),
      ...(registro.dolencias && {
        dolencias: registro.dolencias.map((d: any) => ({
          id: d.id.toString(),
          zona: d.zona,
          nivel: d.nivel,
          descripcion: d.descripcion,
          tipoLesion: d.tipoLesion,
          recuperado: d.recuperado,
          fechaRecuperacion: d.fechaRecuperacion,
        })),
      }),
    };
  }
}
