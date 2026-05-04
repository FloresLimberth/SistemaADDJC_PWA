// Controller de Recomendaciones - Flujo de Aprobacion
// Endpoints para que COMITE_TECNICO revise, apruebe, rechace o modifique recomendaciones
// Basado en patron Human-in-the-Loop

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ForbiddenException,
} from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { AccessControlService } from '../../common/services/access-control.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EstadoRecomendacion, Prioridad } from '@prisma/client';
import {
  AprobarRecomendacionDto,
  RechazarRecomendacionDto,
  ModificarRecomendacionDto,
} from './dto';

@Controller('recomendaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecomendacionesController {
  constructor(
    private readonly recomendacionesService: RecomendacionesService,
    private readonly accessControl: AccessControlService,
  ) {}

  // GET /api/recomendaciones/pendientes - Listar recomendaciones pendientes de revision
  // Solo COMITE_TECNICO puede ver pendientes
  @Get('pendientes')
  @Roles('COMITE_TECNICO')
  async listarPendientes(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('prioridad') prioridad?: Prioridad,
    @Query('atletaId') atletaId?: string
  ) {
    return this.recomendacionesService.findPendientes(page, limit, prioridad, atletaId);
  }

  // GET /api/recomendaciones/estadisticas - Dashboard de estadisticas
  // Solo COMITE_TECNICO
  @Get('estadisticas')
  @Roles('COMITE_TECNICO')
  async obtenerEstadisticas() {
    return this.recomendacionesService.getEstadisticas();
  }

  // GET /api/recomendaciones/feedback - Feedback de rechazos para mejorar algoritmo
  // Solo COMITE_TECNICO
  @Get('feedback')
  @Roles('COMITE_TECNICO')
  async obtenerFeedback(@Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number) {
    return this.recomendacionesService.getFeedbackRechazos(limit);
  }

  // GET /api/recomendaciones - Listar todas las recomendaciones con filtros
  // ENTRENADOR: si pasa atletaId, se valida ownership. Sin atletaId, el service
  // deberia filtrar por atletas asignados (si no lo hace, ve todas)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async listar(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('estado') estado?: EstadoRecomendacion,
    @Query('atletaId') atletaId?: string,
    @CurrentUser() user?: any
  ) {
    // ENTRENADOR: si filtra por atletaId, validar que sea su atleta
    if (user && user.rol === 'ENTRENADOR' && atletaId) {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        BigInt(user.id),
        user.rol,
        BigInt(atletaId),
      );
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes ver recomendaciones de tus atletas asignados');
      }
    }

    return this.recomendacionesService.findAll(page, limit, estado, atletaId);
  }

  // GET /api/recomendaciones/:id - Obtener una recomendacion por ID
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async obtenerPorId(@Param('id') id: string, @CurrentUser() user: any) {
    const recomendacion = await this.recomendacionesService.findOne(id, BigInt(user.id), user.rol);

    // ENTRENADOR: validar que la recomendacion pertenece a uno de sus atletas
    if (user.rol === 'ENTRENADOR' && recomendacion && recomendacion.atletaId) {
      const atletaId = typeof recomendacion.atletaId === 'string'
        ? BigInt(recomendacion.atletaId)
        : recomendacion.atletaId;
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        BigInt(user.id),
        user.rol,
        atletaId,
      );
      if (!hasAccess) {
        throw new ForbiddenException('No tienes acceso a esta recomendacion');
      }
    }

    return recomendacion;
  }

  // GET /api/recomendaciones/:id/historial - Obtener historial de cambios (Audit Trail)
  @Get(':id/historial')
  @Roles('COMITE_TECNICO')
  async obtenerHistorial(@Param('id') id: string) {
    return this.recomendacionesService.getHistorial(id);
  }

  // POST /api/recomendaciones/:id/revisar - Iniciar revision (cambiar a EN_PROCESO)
  @Post(':id/revisar')
  @Roles('COMITE_TECNICO')
  async iniciarRevision(@Param('id') id: string, @CurrentUser() user: any) {
    return this.recomendacionesService.iniciarRevision(id, BigInt(user.id));
  }

  // POST /api/recomendaciones/:id/aprobar - Aprobar recomendacion
  // Cambia estado a CUMPLIDA y aprueba sesiones asociadas
  @Post(':id/aprobar')
  @Roles('COMITE_TECNICO')
  async aprobar(
    @Param('id') id: string,
    @Body() dto: AprobarRecomendacionDto,
    @CurrentUser() user: any
  ) {
    return this.recomendacionesService.aprobar(id, BigInt(user.id), dto);
  }

  // POST /api/recomendaciones/:id/rechazar - Rechazar recomendacion
  // Cambia estado a RECHAZADA, guarda feedback para mejorar algoritmo
  @Post(':id/rechazar')
  @Roles('COMITE_TECNICO')
  async rechazar(
    @Param('id') id: string,
    @Body() dto: RechazarRecomendacionDto,
    @CurrentUser() user: any
  ) {
    return this.recomendacionesService.rechazar(id, BigInt(user.id), dto);
  }

  // POST /api/recomendaciones/:id/modificar - Modificar y aprobar recomendacion
  // Cambia estado a MODIFICADA, aplica ajustes del COMITE
  @Post(':id/modificar')
  @Roles('COMITE_TECNICO')
  async modificar(
    @Param('id') id: string,
    @Body() dto: ModificarRecomendacionDto,
    @CurrentUser() user: any
  ) {
    return this.recomendacionesService.modificar(id, BigInt(user.id), dto);
  }
}
