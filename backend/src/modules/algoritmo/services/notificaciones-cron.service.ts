// Servicio de Cron Jobs para Notificaciones Automaticas
// Ejecuta tareas programadas para enviar recordatorios a atletas y entrenadores

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../database/prisma.service';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class NotificacionesCronService {
  private readonly logger = new Logger(NotificacionesCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService
  ) {}

  // Ejecuta todos los dias a las 7:00 AM
  // Notifica a los atletas sobre sesiones programadas para hoy
  @Cron('0 7 * * *', { name: 'notificar-sesiones-hoy' })
  async notificarSesionesHoy() {
    this.logger.log('Iniciando tarea: notificar sesiones del dia');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      // Buscar sesiones de hoy que estan aprobadas
      // Relacion: Sesion -> Microciclo -> AsignacionAtletaMicrociclo -> Atleta
      const sesionesHoy = await this.prisma.sesion.findMany({
        where: {
          fecha: {
            gte: hoy,
            lt: manana,
          },
          aprobado: true,
        },
        include: {
          microciclo: {
            include: {
              asignacionesAtletas: {
                include: {
                  atleta: {
                    select: {
                      usuarioId: true,
                      usuario: { select: { nombreCompleto: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      let notificacionesEnviadas = 0;

      for (const sesion of sesionesHoy) {
        const asignaciones = sesion.microciclo?.asignacionesAtletas || [];
        for (const asignacion of asignaciones) {
          if (asignacion.atleta) {
            await this.notificacionesService.notificarSesionProxima(
              asignacion.atleta.usuarioId,
              sesion.fecha,
              sesion.tipoSesion
            );
            notificacionesEnviadas++;
          }
        }
      }

      this.logger.log(
        `Tarea completada: ${notificacionesEnviadas} notificaciones de sesion enviadas`
      );
    } catch (error) {
      this.logger.error('Error en tarea notificar-sesiones-hoy:', error);
    }
  }

  // Ejecuta todos los dias a las 8:00 AM
  // Notifica sobre tests fisicos programados para la proxima semana
  @Cron('0 8 * * *', { name: 'notificar-tests-pendientes' })
  async notificarTestsPendientes() {
    this.logger.log('Iniciando tarea: notificar tests pendientes');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const enUnaSemana = new Date(hoy);
      enUnaSemana.setDate(enUnaSemana.getDate() + 7);

      // Buscar sesiones de tipo TEST en la proxima semana
      // Relacion: Sesion -> Microciclo -> AsignacionAtletaMicrociclo -> Atleta
      const sesionesTest = await this.prisma.sesion.findMany({
        where: {
          fecha: {
            gte: hoy,
            lte: enUnaSemana,
          },
          tipoSesion: 'TEST',
          aprobado: true,
        },
        include: {
          microciclo: {
            include: {
              asignacionesAtletas: {
                include: {
                  atleta: {
                    select: {
                      usuarioId: true,
                      entrenadorAsignado: {
                        select: { usuarioId: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      let notificacionesEnviadas = 0;

      for (const sesion of sesionesTest) {
        const asignaciones = sesion.microciclo?.asignacionesAtletas || [];
        for (const asignacion of asignaciones) {
          if (asignacion.atleta) {
            await this.notificacionesService.notificarTestPendiente(
              asignacion.atleta.usuarioId,
              asignacion.atleta.entrenadorAsignado?.usuarioId || null,
              sesion.fecha
            );
            notificacionesEnviadas++;
          }
        }
      }

      this.logger.log(
        `Tarea completada: ${notificacionesEnviadas} notificaciones de test enviadas`
      );
    } catch (error) {
      this.logger.error('Error en tarea notificar-tests-pendientes:', error);
    }
  }

  // Ejecuta los domingos a las 3:00 AM
  // Limpia notificaciones antiguas (mas de 30 dias y leidas)
  @Cron('0 3 * * 0', { name: 'limpiar-notificaciones-antiguas' })
  async limpiarNotificacionesAntiguas() {
    this.logger.log('Iniciando tarea: limpiar notificaciones antiguas');

    try {
      const resultado = await this.notificacionesService.limpiarNotificacionesAntiguas();

      this.logger.log(
        `Tarea completada: ${resultado.eliminadas} notificaciones antiguas eliminadas`
      );
    } catch (error) {
      this.logger.error('Error en tarea limpiar-notificaciones-antiguas:', error);
    }
  }

  // Metodo para ejecutar manualmente las tareas (para testing o administracion)
  async ejecutarTareaManual(tarea: 'sesiones' | 'tests' | 'limpiar') {
    switch (tarea) {
      case 'sesiones':
        await this.notificarSesionesHoy();
        break;
      case 'tests':
        await this.notificarTestsPendientes();
        break;
      case 'limpiar':
        await this.limpiarNotificacionesAntiguas();
        break;
    }
  }
}
