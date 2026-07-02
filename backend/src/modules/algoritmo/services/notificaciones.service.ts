// Servicio de Notificaciones del Sistema
// Gestiona las notificaciones enviadas a usuarios

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { TipoNotificacion, Prioridad, RolUsuario } from '@prisma/client';

// DTO para crear notificacion
export interface CreateNotificacionDto {
  destinatarioId: bigint;
  recomendacionId?: bigint;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  prioridad?: Prioridad;
}

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  // Crear una notificacion
  async crear(data: CreateNotificacionDto) {
    const notificacion = await this.prisma.notificacion.create({
      data: {
        destinatarioId: data.destinatarioId,
        recomendacionId: data.recomendacionId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensaje: data.mensaje,
        prioridad: data.prioridad || 'MEDIA',
      },
    });

    return this.formatearNotificacion(notificacion);
  }

  // Obtener notificaciones de un usuario
  async obtenerNotificacionesUsuario(
    usuarioId: bigint,
    soloNoLeidas: boolean = false,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = { destinatarioId: usuarioId };

    if (soloNoLeidas) {
      whereClause.leida = false;
    }

    const [notificaciones, total] = await Promise.all([
      this.prisma.notificacion.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [{ prioridad: 'asc' }, { createdAt: 'desc' }],
        include: {
          recomendacion: {
            select: {
              id: true,
              tipo: true,
              titulo: true,
              estado: true,
            },
          },
        },
      }),
      this.prisma.notificacion.count({ where: whereClause }),
    ]);

    return {
      data: notificaciones.map((n) => this.formatearNotificacion(n)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        noLeidas: await this.contarNoLeidas(usuarioId),
      },
    };
  }

  // Obtener una notificacion por ID
  async obtenerPorId(notificacionId: bigint, usuarioId: bigint) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        destinatarioId: usuarioId,
      },
      include: {
        recomendacion: {
          select: {
            id: true,
            tipo: true,
            titulo: true,
            mensaje: true,
            estado: true,
            accionSugerida: true,
          },
        },
      },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    return this.formatearNotificacion(notificacion);
  }

  // Marcar notificacion como leida
  async marcarComoLeida(notificacionId: bigint, usuarioId: bigint) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        destinatarioId: usuarioId,
      },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    const actualizada = await this.prisma.notificacion.update({
      where: { id: notificacionId },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    return this.formatearNotificacion(actualizada);
  }

  // Marcar todas las notificaciones como leidas
  async marcarTodasComoLeidas(usuarioId: bigint) {
    const resultado = await this.prisma.notificacion.updateMany({
      where: {
        destinatarioId: usuarioId,
        leida: false,
      },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });

    return {
      notificacionesMarcadas: resultado.count,
    };
  }

  // Contar notificaciones no leidas
  async contarNoLeidas(usuarioId: bigint): Promise<number> {
    return await this.prisma.notificacion.count({
      where: {
        destinatarioId: usuarioId,
        leida: false,
      },
    });
  }

  // Contar recomendaciones pendientes (solo PENDIENTE)
  // Usado por el endpoint de centro de notificaciones total
  // Consistente con el tab de Recomendaciones que solo muestra pendientes
  async contarRecomendacionesPendientes(): Promise<number> {
    return await this.prisma.recomendacion.count({
      where: {
        estado: 'PENDIENTE',
      },
    });
  }

  // Eliminar notificacion
  async eliminar(notificacionId: bigint, usuarioId: bigint) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        id: notificacionId,
        destinatarioId: usuarioId,
      },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    await this.prisma.notificacion.delete({
      where: { id: notificacionId },
    });

    return { eliminada: true };
  }

  // Eliminar notificaciones antiguas (mas de 30 dias y leidas)
  async limpiarNotificacionesAntiguas() {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const resultado = await this.prisma.notificacion.deleteMany({
      where: {
        leida: true,
        createdAt: { lt: hace30Dias },
      },
    });

    return {
      eliminadas: resultado.count,
    };
  }

  // Crear notificacion de planificacion aprobada
  async notificarPlanificacionAprobada(
    atletaUsuarioId: bigint,
    entrenadorUsuarioId: bigint | null,
    codigoMicrociclo: string
  ) {
    const notificaciones: CreateNotificacionDto[] = [];

    // Notificacion para el atleta
    notificaciones.push({
      destinatarioId: atletaUsuarioId,
      tipo: 'PLANIFICACION_APROBADA',
      titulo: 'Nueva planificacion disponible',
      mensaje: `Tu microciclo ${codigoMicrociclo} ha sido aprobado y esta listo para ejecutar.`,
      prioridad: 'MEDIA',
    });

    // Notificacion para el entrenador si existe
    if (entrenadorUsuarioId) {
      notificaciones.push({
        destinatarioId: entrenadorUsuarioId,
        tipo: 'PLANIFICACION_APROBADA',
        titulo: 'Planificacion aprobada',
        mensaje: `El microciclo ${codigoMicrociclo} ha sido aprobado para tu atleta.`,
        prioridad: 'BAJA',
      });
    }

    // Crear todas las notificaciones
    for (const notif of notificaciones) {
      await this.crear(notif);
    }

    return { notificacionesCreadas: notificaciones.length };
  }

  // Crear notificacion de sesion proxima
  async notificarSesionProxima(atletaUsuarioId: bigint, sesionFecha: Date, tipoSesion: string) {
    return await this.crear({
      destinatarioId: atletaUsuarioId,
      tipo: 'SESION_PROXIMA',
      titulo: 'Sesion programada',
      mensaje: `Tienes una sesion de ${tipoSesion} programada para ${sesionFecha.toLocaleDateString()}.`,
      prioridad: 'MEDIA',
    });
  }

  // Crear notificacion de test pendiente
  async notificarTestPendiente(
    atletaUsuarioId: bigint,
    entrenadorUsuarioId: bigint | null,
    fechaTest: Date
  ) {
    const notificaciones: CreateNotificacionDto[] = [];

    notificaciones.push({
      destinatarioId: atletaUsuarioId,
      tipo: 'TEST_PENDIENTE',
      titulo: 'Test fisico pendiente',
      mensaje: `Tienes un test fisico programado para ${fechaTest.toLocaleDateString()}.`,
      prioridad: 'ALTA',
    });

    if (entrenadorUsuarioId) {
      notificaciones.push({
        destinatarioId: entrenadorUsuarioId,
        tipo: 'TEST_PENDIENTE',
        titulo: 'Test fisico pendiente',
        mensaje: `Tu atleta tiene un test fisico programado para ${fechaTest.toLocaleDateString()}.`,
        prioridad: 'MEDIA',
      });
    }

    for (const notif of notificaciones) {
      await this.crear(notif);
    }

    return { notificacionesCreadas: notificaciones.length };
  }

  // Formatea notificacion para respuesta
  private formatearNotificacion(notificacion: any) {
    return {
      id: notificacion.id.toString(),
      destinatarioId: notificacion.destinatarioId.toString(),
      recomendacionId: notificacion.recomendacionId?.toString() || null,
      tipo: notificacion.tipo,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      leida: notificacion.leida,
      fechaLeida: notificacion.fechaLeida,
      prioridad: notificacion.prioridad,
      createdAt: notificacion.createdAt,
      updatedAt: notificacion.updatedAt,
      ...(notificacion.recomendacion && {
        recomendacion: {
          id: notificacion.recomendacion.id.toString(),
          tipo: notificacion.recomendacion.tipo,
          titulo: notificacion.recomendacion.titulo,
          estado: notificacion.recomendacion.estado,
          accionSugerida: notificacion.recomendacion.accionSugerida,
        },
      }),
    };
  }
}
