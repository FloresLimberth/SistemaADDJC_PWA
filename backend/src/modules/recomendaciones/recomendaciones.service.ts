// Servicio de Recomendaciones con flujo de aprobacion
// Implementa: State Machine, Human-in-the-Loop, Audit Trail, Feedback Loop
// Basado en mejores practicas de sistemas de aprobacion y decision support

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificacionesService } from '../algoritmo/services/notificaciones.service';
import { EstadoRecomendacion, RolUsuario, Prioridad } from '@prisma/client';
import {
  AprobarRecomendacionDto,
  RechazarRecomendacionDto,
  ModificarRecomendacionDto,
} from './dto';

// Transiciones validas del State Machine
// PENDIENTE -> EN_PROCESO -> CUMPLIDA/RECHAZADA/MODIFICADA
const TRANSICIONES_VALIDAS: Record<EstadoRecomendacion, EstadoRecomendacion[]> = {
  PENDIENTE: ['EN_PROCESO'],
  EN_PROCESO: ['CUMPLIDA', 'RECHAZADA', 'MODIFICADA'],
  CUMPLIDA: [], // Estado final
  RECHAZADA: [], // Estado final
  MODIFICADA: [], // Estado final, pero con cambios aplicados
};

// Tipos de acciones para el historial
type AccionHistorial =
  | 'CREADA'
  | 'EN_REVISION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'MODIFICADA'
  | 'SESIONES_CREADAS';

@Injectable()
export class RecomendacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService
  ) {}

  // Validar transicion de estado (State Machine)
  private validarTransicion(
    estadoActual: EstadoRecomendacion,
    estadoNuevo: EstadoRecomendacion
  ): boolean {
    const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];
    return transicionesPermitidas.includes(estadoNuevo);
  }

  // Registrar cambio en historial (Audit Trail)
  private async registrarHistorial(
    recomendacionId: bigint,
    estadoAnterior: EstadoRecomendacion | null,
    estadoNuevo: EstadoRecomendacion,
    usuarioId: bigint,
    accion: AccionHistorial,
    comentario?: string,
    datosAdicionales?: any
  ): Promise<void> {
    await this.prisma.historialRecomendacion.create({
      data: {
        recomendacionId,
        estadoAnterior,
        estadoNuevo,
        usuarioId,
        accion,
        comentario,
        datosAdicionales: datosAdicionales ? datosAdicionales : undefined,
      },
    });
  }

  // Obtener recomendacion por ID con validaciones
  async findOne(id: string, userId: bigint, userRole: RolUsuario) {
    const recomendacion = await this.prisma.recomendacion.findUnique({
      where: { id: BigInt(id) },
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
        microcicloAfectado: {
          select: {
            id: true,
            codigoMicrociclo: true,
            fechaInicio: true,
            fechaFin: true,
            tipoMicrociclo: true,
          },
        },
        sesionGenerada: {
          select: {
            id: true,
            fecha: true,
            tipoSesion: true,
            aprobado: true,
          },
        },
        revisor: {
          select: { nombreCompleto: true },
        },
        aplicador: {
          select: { nombreCompleto: true },
        },
        historial: {
          orderBy: { createdAt: 'desc' },
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    if (!recomendacion) {
      throw new NotFoundException(`Recomendacion con ID ${id} no encontrada`);
    }

    return this.formatResponse(recomendacion);
  }

  // Listar recomendaciones pendientes de revision (para COMITE_TECNICO)
  async findPendientes(page = 1, limit = 10, prioridad?: Prioridad, atletaId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      estado: { in: ['PENDIENTE', 'EN_PROCESO'] },
    };

    if (prioridad) {
      where.prioridad = prioridad;
    }

    if (atletaId) {
      where.atletaId = BigInt(atletaId);
    }

    const [recomendaciones, total] = await Promise.all([
      this.prisma.recomendacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { prioridad: 'desc' }, // CRITICA primero
          { createdAt: 'asc' }, // Mas antiguas primero
        ],
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
          microcicloAfectado: {
            select: {
              codigoMicrociclo: true,
              tipoMicrociclo: true,
            },
          },
        },
      }),
      this.prisma.recomendacion.count({ where }),
    ]);

    return {
      data: recomendaciones.map((r) => this.formatResponse(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pendientes: total,
      },
    };
  }

  // Listar todas las recomendaciones con filtros
  async findAll(page = 1, limit = 10, estado?: EstadoRecomendacion, atletaId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (atletaId) {
      where.atletaId = BigInt(atletaId);
    }

    const [recomendaciones, total] = await Promise.all([
      this.prisma.recomendacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
          microcicloAfectado: {
            select: {
              codigoMicrociclo: true,
              tipoMicrociclo: true,
            },
          },
          revisor: {
            select: { nombreCompleto: true },
          },
        },
      }),
      this.prisma.recomendacion.count({ where }),
    ]);

    return {
      data: recomendaciones.map((r) => this.formatResponse(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Iniciar revision de una recomendacion (cambiar a EN_PROCESO)
  async iniciarRevision(id: string, userId: bigint) {
    const recomendacion = await this.prisma.recomendacion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!recomendacion) {
      throw new NotFoundException(`Recomendacion con ID ${id} no encontrada`);
    }

    if (!this.validarTransicion(recomendacion.estado, 'EN_PROCESO')) {
      throw new BadRequestException(
        `No se puede iniciar revision de una recomendacion en estado ${recomendacion.estado}`
      );
    }

    const actualizada = await this.prisma.recomendacion.update({
      where: { id: BigInt(id) },
      data: {
        estado: 'EN_PROCESO',
        revisadoPor: userId,
        fechaRevision: new Date(),
      },
      include: {
        atleta: {
          include: {
            usuario: { select: { nombreCompleto: true } },
          },
        },
      },
    });

    // Registrar en historial
    await this.registrarHistorial(
      BigInt(id),
      recomendacion.estado,
      'EN_PROCESO',
      userId,
      'EN_REVISION',
      'Recomendacion tomada para revision'
    );

    return this.formatResponse(actualizada);
  }

  // APROBAR recomendacion (Human-in-the-Loop approval)
  async aprobar(id: string, userId: bigint, dto: AprobarRecomendacionDto) {
    const recomendacion = await this.prisma.recomendacion.findUnique({
      where: { id: BigInt(id) },
      include: {
        sesionGenerada: true,
        microcicloAfectado: true,
      },
    });

    if (!recomendacion) {
      throw new NotFoundException(`Recomendacion con ID ${id} no encontrada`);
    }

    // Validar transicion de estado
    if (!this.validarTransicion(recomendacion.estado, 'CUMPLIDA')) {
      throw new BadRequestException(
        `No se puede aprobar una recomendacion en estado ${recomendacion.estado}. ` +
          `Primero debe estar EN_PROCESO.`
      );
    }

    // Transaccion: actualizar recomendacion y aprobar sesiones si existen
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Actualizar recomendacion a CUMPLIDA
      const actualizada = await tx.recomendacion.update({
        where: { id: BigInt(id) },
        data: {
          estado: 'CUMPLIDA',
          aplicadoPor: userId,
          fechaAplicacion: new Date(),
          comentarioRevision: dto.comentario,
        },
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true, id: true } },
              entrenadorAsignado: {
                select: { usuarioId: true },
              },
            },
          },
          microcicloAfectado: {
            select: {
              id: true,
              codigoMicrociclo: true,
            },
          },
        },
      });

      // Si tiene sesion generada, aprobarla
      if (recomendacion.sesionGeneradaId) {
        await tx.sesion.update({
          where: { id: recomendacion.sesionGeneradaId },
          data: { aprobado: true },
        });
      }

      // Si tiene sesiones afectadas (JSON), aprobarlas
      if (recomendacion.sesionesAfectadas) {
        const sesionesIds = recomendacion.sesionesAfectadas as number[];
        if (Array.isArray(sesionesIds) && sesionesIds.length > 0) {
          await tx.sesion.updateMany({
            where: { id: { in: sesionesIds.map((id) => BigInt(id)) } },
            data: { aprobado: true },
          });
        }
      }

      return actualizada;
    });

    // Registrar en historial (fuera de transaccion para no bloquear)
    await this.registrarHistorial(
      BigInt(id),
      recomendacion.estado,
      'CUMPLIDA',
      userId,
      'APROBADA',
      dto.comentario || 'Recomendacion aprobada',
      { sesionAprobada: recomendacion.sesionGeneradaId?.toString() }
    );

    // Notificar al atleta y entrenador
    try {
      const codigoMicrociclo = resultado.microcicloAfectado?.codigoMicrociclo || 'desconocido';
      const entrenadorUsuarioId = resultado.atleta.entrenadorAsignado?.usuarioId || null;

      await this.notificacionesService.notificarPlanificacionAprobada(
        resultado.atleta.usuario.id,
        entrenadorUsuarioId,
        codigoMicrociclo
      );
    } catch (error) {
      // No fallar si la notificacion no se puede crear
      console.error('Error creando notificaciones de aprobacion:', error);
    }

    return {
      ...this.formatResponse(resultado),
      mensaje: 'Recomendacion aprobada exitosamente',
    };
  }

  // RECHAZAR recomendacion (Feedback Loop - el algoritmo aprende)
  // Al rechazar, se eliminan las sesiones generadas por el algoritmo
  async rechazar(id: string, userId: bigint, dto: RechazarRecomendacionDto) {
    const recomendacion = await this.prisma.recomendacion.findUnique({
      where: { id: BigInt(id) },
    });

    if (!recomendacion) {
      throw new NotFoundException(`Recomendacion con ID ${id} no encontrada`);
    }

    if (!this.validarTransicion(recomendacion.estado, 'RECHAZADA')) {
      throw new BadRequestException(
        `No se puede rechazar una recomendacion en estado ${recomendacion.estado}. ` +
          `Primero debe estar EN_PROCESO.`
      );
    }

    // Guardar el motivo de rechazo para feedback loop
    // El algoritmo puede usar esta informacion para mejorar
    const feedbackData = {
      motivoRechazo: dto.motivo,
      accionAlternativa: dto.accionAlternativa,
      fechaRechazo: new Date().toISOString(),
      tipoRecomendacionRechazada: recomendacion.tipo,
      prioridadOriginal: recomendacion.prioridad,
    };

    // Transaccion: eliminar sesiones y actualizar recomendacion
    let sesionesEliminadas = 0;
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Eliminar sesion generada individual si existe
      if (recomendacion.sesionGeneradaId) {
        await tx.sesion.delete({
          where: { id: recomendacion.sesionGeneradaId },
        });
        sesionesEliminadas++;
      }

      // Eliminar sesiones afectadas (JSON array) si existen
      if (recomendacion.sesionesAfectadas) {
        const sesionesIds = recomendacion.sesionesAfectadas as number[];
        if (Array.isArray(sesionesIds) && sesionesIds.length > 0) {
          const deleted = await tx.sesion.deleteMany({
            where: { id: { in: sesionesIds.map((sid) => BigInt(sid)) } },
          });
          sesionesEliminadas += deleted.count;
        }
      }

      // Actualizar recomendacion a RECHAZADA
      const actualizada = await tx.recomendacion.update({
        where: { id: BigInt(id) },
        data: {
          estado: 'RECHAZADA',
          revisadoPor: userId,
          fechaRevision: new Date(),
          comentarioRevision: dto.motivo,
          // Guardar feedback en datosAnalisis para que el algoritmo lo use
          datosAnalisis: {
            ...((recomendacion.datosAnalisis as object) || {}),
            feedback: feedbackData,
          },
          // Limpiar referencias a sesiones eliminadas
          sesionGeneradaId: null,
          sesionesAfectadas: [],
        },
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true } },
            },
          },
        },
      });

      return actualizada;
    });

    // Registrar en historial con detalles del rechazo
    await this.registrarHistorial(
      BigInt(id),
      recomendacion.estado,
      'RECHAZADA',
      userId,
      'RECHAZADA',
      dto.motivo,
      {
        accionAlternativa: dto.accionAlternativa,
        tipoRecomendacion: recomendacion.tipo,
        sesionesEliminadas,
      }
    );

    return {
      ...this.formatResponse(resultado),
      mensaje: `Recomendacion rechazada. Se eliminaron ${sesionesEliminadas} sesiones. El COMITE debe crear la planificacion manualmente.`,
      feedbackRegistrado: true,
      sesionesEliminadas,
    };
  }

  // MODIFICAR recomendacion antes de aplicar (ajustes del COMITE)
  async modificar(id: string, userId: bigint, dto: ModificarRecomendacionDto) {
    const recomendacion = await this.prisma.recomendacion.findUnique({
      where: { id: BigInt(id) },
      include: {
        sesionGenerada: true,
      },
    });

    if (!recomendacion) {
      throw new NotFoundException(`Recomendacion con ID ${id} no encontrada`);
    }

    if (!this.validarTransicion(recomendacion.estado, 'MODIFICADA')) {
      throw new BadRequestException(
        `No se puede modificar una recomendacion en estado ${recomendacion.estado}. ` +
          `Primero debe estar EN_PROCESO.`
      );
    }

    // Transaccion: actualizar recomendacion y aplicar modificaciones a sesiones
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Actualizar recomendacion con las modificaciones
      const actualizada = await tx.recomendacion.update({
        where: { id: BigInt(id) },
        data: {
          estado: 'MODIFICADA',
          aplicadoPor: userId,
          fechaAplicacion: new Date(),
          modificaciones: JSON.parse(JSON.stringify(dto.modificaciones)),
          comentarioRevision: dto.justificacion,
        },
        include: {
          atleta: {
            include: {
              usuario: { select: { nombreCompleto: true, id: true } },
              entrenadorAsignado: {
                select: { usuarioId: true },
              },
            },
          },
          microcicloAfectado: {
            select: {
              id: true,
              codigoMicrociclo: true,
            },
          },
        },
      });

      // Si tiene sesion generada, aprobarla
      if (recomendacion.sesionGeneradaId) {
        await tx.sesion.update({
          where: { id: recomendacion.sesionGeneradaId },
          data: { aprobado: true },
        });
      }

      return actualizada;
    });

    // Registrar en historial con detalles de modificacion
    await this.registrarHistorial(
      BigInt(id),
      recomendacion.estado,
      'MODIFICADA',
      userId,
      'MODIFICADA',
      dto.justificacion,
      {
        modificaciones: dto.modificaciones,
        comentarioAdicional: dto.comentarioAdicional,
      }
    );

    // Notificar al atleta y entrenador
    try {
      const codigoMicrociclo = resultado.microcicloAfectado?.codigoMicrociclo || 'desconocido';
      const entrenadorUsuarioId = resultado.atleta.entrenadorAsignado?.usuarioId || null;

      await this.notificacionesService.notificarPlanificacionAprobada(
        resultado.atleta.usuario.id,
        entrenadorUsuarioId,
        codigoMicrociclo
      );
    } catch (error) {
      console.error('Error creando notificaciones de modificacion:', error);
    }

    return {
      ...this.formatResponse(resultado),
      mensaje: 'Recomendacion modificada y aplicada exitosamente',
      modificacionesAplicadas: JSON.parse(JSON.stringify(dto.modificaciones)),
    };
  }

  // Obtener historial de una recomendacion (Audit Trail)
  async getHistorial(id: string) {
    const historial = await this.prisma.historialRecomendacion.findMany({
      where: { recomendacionId: BigInt(id) },
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: { nombreCompleto: true, rol: true },
        },
      },
    });

    return historial.map((h) => ({
      id: h.id.toString(),
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      accion: h.accion,
      comentario: h.comentario,
      datosAdicionales: h.datosAdicionales,
      usuario: h.usuario.nombreCompleto,
      rolUsuario: h.usuario.rol,
      fecha: h.createdAt,
    }));
  }

  // Estadisticas de recomendaciones (para dashboard del COMITE)
  async getEstadisticas() {
    const [pendientes, enProceso, cumplidas, rechazadas, modificadas, porPrioridad] =
      await Promise.all([
        this.prisma.recomendacion.count({ where: { estado: 'PENDIENTE' } }),
        this.prisma.recomendacion.count({ where: { estado: 'EN_PROCESO' } }),
        this.prisma.recomendacion.count({ where: { estado: 'CUMPLIDA' } }),
        this.prisma.recomendacion.count({ where: { estado: 'RECHAZADA' } }),
        this.prisma.recomendacion.count({ where: { estado: 'MODIFICADA' } }),
        this.prisma.recomendacion.groupBy({
          by: ['prioridad'],
          where: { estado: { in: ['PENDIENTE', 'EN_PROCESO'] } },
          _count: { prioridad: true },
        }),
      ]);

    const prioridadMap: Record<string, number> = {};
    porPrioridad.forEach((p) => {
      prioridadMap[p.prioridad] = p._count.prioridad;
    });

    return {
      resumen: {
        pendientes,
        enProceso,
        cumplidas,
        rechazadas,
        modificadas,
        total: pendientes + enProceso + cumplidas + rechazadas + modificadas,
      },
      pendientesPorPrioridad: {
        CRITICA: prioridadMap['CRITICA'] || 0,
        ALTA: prioridadMap['ALTA'] || 0,
        MEDIA: prioridadMap['MEDIA'] || 0,
        BAJA: prioridadMap['BAJA'] || 0,
      },
      tasaAprobacion:
        cumplidas + modificadas > 0
          ? Math.round(((cumplidas + modificadas) / (cumplidas + modificadas + rechazadas)) * 100)
          : 0,
      tasaModificacion:
        modificadas > 0 && cumplidas + modificadas > 0
          ? Math.round((modificadas / (cumplidas + modificadas)) * 100)
          : 0,
    };
  }

  // Obtener feedback de rechazos (para mejorar el algoritmo)
  async getFeedbackRechazos(limit = 50) {
    const rechazadas = await this.prisma.recomendacion.findMany({
      where: { estado: 'RECHAZADA' },
      orderBy: { fechaRevision: 'desc' },
      take: limit,
      select: {
        id: true,
        tipo: true,
        prioridad: true,
        datosAnalisis: true,
        comentarioRevision: true,
        fechaRevision: true,
        atleta: {
          select: {
            categoriaPeso: true,
          },
        },
      },
    });

    return rechazadas.map((r) => ({
      id: r.id.toString(),
      tipo: r.tipo,
      prioridad: r.prioridad,
      motivoRechazo: r.comentarioRevision,
      feedback: (r.datosAnalisis as any)?.feedback,
      categoriaPesoAtleta: r.atleta.categoriaPeso,
      fecha: r.fechaRevision,
    }));
  }

  // Formatear respuesta con BigInt a string
  private formatResponse(recomendacion: any) {
    return {
      id: recomendacion.id.toString(),
      atletaId: recomendacion.atletaId.toString(),
      microcicloAfectadoId: recomendacion.microcicloAfectadoId?.toString(),
      tipo: recomendacion.tipo,
      prioridad: recomendacion.prioridad,
      titulo: recomendacion.titulo,
      mensaje: recomendacion.mensaje,
      datosAnalisis: recomendacion.datosAnalisis,
      accionSugerida: recomendacion.accionSugerida,
      sesionesAfectadas: recomendacion.sesionesAfectadas,
      generoSesiones: recomendacion.generoSesiones,
      sesionGeneradaId: recomendacion.sesionGeneradaId?.toString(),
      estado: recomendacion.estado,
      revisadoPor: recomendacion.revisadoPor?.toString(),
      fechaRevision: recomendacion.fechaRevision,
      comentarioRevision: recomendacion.comentarioRevision,
      modificaciones: recomendacion.modificaciones,
      aplicadoPor: recomendacion.aplicadoPor?.toString(),
      fechaAplicacion: recomendacion.fechaAplicacion,
      createdAt: recomendacion.createdAt,
      updatedAt: recomendacion.updatedAt,
      ...(recomendacion.atleta && {
        atleta: {
          id: recomendacion.atleta.id.toString(),
          nombreCompleto: recomendacion.atleta.usuario?.nombreCompleto,
        },
      }),
      ...(recomendacion.microcicloAfectado && {
        microcicloAfectado: {
          id: recomendacion.microcicloAfectado.id?.toString(),
          codigoMicrociclo: recomendacion.microcicloAfectado.codigoMicrociclo,
          tipoMicrociclo: recomendacion.microcicloAfectado.tipoMicrociclo,
        },
      }),
      ...(recomendacion.sesionGenerada && {
        sesionGenerada: {
          id: recomendacion.sesionGenerada.id.toString(),
          fecha: recomendacion.sesionGenerada.fecha,
          tipoSesion: recomendacion.sesionGenerada.tipoSesion,
          aprobado: recomendacion.sesionGenerada.aprobado,
        },
      }),
      ...(recomendacion.revisor && {
        revisor: recomendacion.revisor.nombreCompleto,
      }),
      ...(recomendacion.aplicador && {
        aplicador: recomendacion.aplicador.nombreCompleto,
      }),
      ...(recomendacion.historial && {
        historial: recomendacion.historial.map((h: any) => ({
          id: h.id.toString(),
          estadoAnterior: h.estadoAnterior,
          estadoNuevo: h.estadoNuevo,
          accion: h.accion,
          comentario: h.comentario,
          usuario: h.usuario?.nombreCompleto,
          fecha: h.createdAt,
        })),
      }),
    };
  }
}
