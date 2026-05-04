// Controller de Notificaciones y Alertas del Sistema
// Endpoints para gestionar notificaciones de usuarios y alertas automaticas
// IMPORTANTE: Las rutas estaticas deben ir ANTES de las rutas con parametros (:id)

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  ForbiddenException,
} from '@nestjs/common';
import { NotificacionesService } from '../services/notificaciones.service';
import { AlertasSistemaService } from '../services/alertas-sistema.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacionesController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly alertasService: AlertasSistemaService,
    private readonly accessControl: AccessControlService,
  ) {}

  // =====================
  // RUTAS ESTATICAS - NOTIFICACIONES (deben ir primero)
  // =====================

  // GET /api/notificaciones - Obtener notificaciones del usuario actual
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async obtenerMisNotificaciones(
    @CurrentUser() user: any,
    @Query('soloNoLeidas', new DefaultValuePipe(false), ParseBoolPipe) soloNoLeidas: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return await this.notificacionesService.obtenerNotificacionesUsuario(
      BigInt(user.id),
      soloNoLeidas,
      page,
      limit
    );
  }

  // GET /api/notificaciones/no-leidas/count - Contar notificaciones no leidas
  @Get('no-leidas/count')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async contarNoLeidas(@CurrentUser() user: any) {
    const count = await this.notificacionesService.contarNoLeidas(BigInt(user.id));
    return { noLeidas: count };
  }

  // POST /api/notificaciones/leer-todas - Marcar todas como leidas
  @Post('leer-todas')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async marcarTodasComoLeidas(@CurrentUser() user: any) {
    return await this.notificacionesService.marcarTodasComoLeidas(BigInt(user.id));
  }

  // =====================
  // RUTAS ESTATICAS - ALERTAS (deben ir antes de :id)
  // =====================

  // GET /api/notificaciones/alertas/mis-alertas - Obtener alertas del usuario actual
  @Get('alertas/mis-alertas')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async obtenerMisAlertas(
    @CurrentUser() user: any,
    @Query('soloNoLeidas', new DefaultValuePipe(false), ParseBoolPipe) soloNoLeidas: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return await this.alertasService.obtenerAlertasDestinatario(
      BigInt(user.id),
      soloNoLeidas,
      page,
      limit
    );
  }

  // GET /api/notificaciones/alertas/no-leidas/count - Contar alertas no leidas
  @Get('alertas/no-leidas/count')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async contarAlertasNoLeidas(@CurrentUser() user: any) {
    return await this.alertasService.contarAlertasNoLeidas(BigInt(user.id));
  }

  // GET /api/notificaciones/alertas/atleta/:atletaId - Alertas de un atleta especifico
  @Get('alertas/atleta/:atletaId')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async obtenerAlertasAtleta(
    @Param('atletaId') atletaId: string,
    @Query('soloNoLeidas', new DefaultValuePipe(false), ParseBoolPipe) soloNoLeidas: boolean,
    @CurrentUser() user: any
  ) {
    // ENTRENADOR solo puede ver alertas de sus atletas asignados
    if (user.rol === 'ENTRENADOR') {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        BigInt(user.id),
        user.rol,
        BigInt(atletaId),
      );
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes ver alertas de tus atletas asignados');
      }
    }

    return await this.alertasService.obtenerAlertasAtleta(BigInt(atletaId), soloNoLeidas);
  }

  // POST /api/notificaciones/alertas/leer-todas - Marcar todas las alertas como leidas
  @Post('alertas/leer-todas')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async marcarTodasAlertasComoLeidas(@CurrentUser() user: any) {
    return await this.alertasService.marcarTodasLeidas(BigInt(user.id));
  }

  // PATCH /api/notificaciones/alertas/:alertaId/leer - Marcar alerta como leida
  @Patch('alertas/:alertaId/leer')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async marcarAlertaComoLeida(@Param('alertaId') alertaId: string, @CurrentUser() user: any) {
    const resultado = await this.alertasService.marcarAlertaLeida(
      BigInt(alertaId),
      BigInt(user.id)
    );

    if (!resultado) {
      return { error: 'Alerta no encontrada o no tienes permiso' };
    }

    return resultado;
  }

  // =====================
  // RUTAS ESTATICAS - RESUMEN
  // =====================

  // GET /api/notificaciones/resumen/general - Resumen de notificaciones y alertas
  @Get('resumen/general')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async obtenerResumen(@CurrentUser() user: any) {
    const usuarioId = BigInt(user.id);

    const [notificacionesNoLeidas, alertasNoLeidas] = await Promise.all([
      this.notificacionesService.contarNoLeidas(usuarioId),
      user.rol === 'COMITE_TECNICO' || user.rol === 'ENTRENADOR'
        ? this.alertasService.contarAlertasNoLeidas(usuarioId)
        : Promise.resolve({ noLeidas: 0 }),
    ]);

    return {
      notificacionesNoLeidas,
      alertasNoLeidas: alertasNoLeidas.noLeidas,
      total: notificacionesNoLeidas + alertasNoLeidas.noLeidas,
    };
  }

  // GET /api/notificaciones/centro/total - Total para badge del sidebar
  // Suma: recomendaciones pendientes + alertas no leidas + notificaciones no leidas
  @Get('centro/total')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async obtenerTotalCentroNotificaciones(@CurrentUser() user: any) {
    const usuarioId = BigInt(user.id);

    const [recomendacionesPendientes, alertasNoLeidas, notificacionesNoLeidas] = await Promise.all([
      this.notificacionesService.contarRecomendacionesPendientes(),
      this.alertasService.contarAlertasNoLeidas(usuarioId),
      this.notificacionesService.contarNoLeidas(usuarioId),
    ]);

    return {
      recomendaciones: recomendacionesPendientes,
      alertas: alertasNoLeidas.noLeidas,
      informativas: notificacionesNoLeidas,
      total: recomendacionesPendientes + alertasNoLeidas.noLeidas + notificacionesNoLeidas,
    };
  }

  // =====================
  // RUTAS CON PARAMETRO :id (deben ir AL FINAL)
  // =====================

  // GET /api/notificaciones/:id - Obtener una notificacion por ID
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async obtenerNotificacion(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.notificacionesService.obtenerPorId(BigInt(id), BigInt(user.id));
  }

  // PATCH /api/notificaciones/:id/leer - Marcar notificacion como leida
  @Patch(':id/leer')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async marcarComoLeida(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.notificacionesService.marcarComoLeida(BigInt(id), BigInt(user.id));
  }

  // DELETE /api/notificaciones/:id - Eliminar notificacion
  @Delete(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA', 'ADMINISTRADOR')
  async eliminarNotificacion(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.notificacionesService.eliminar(BigInt(id), BigInt(user.id));
  }
}
