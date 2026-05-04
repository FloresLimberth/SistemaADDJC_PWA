import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// Controlador de estadisticas para graficos del entrenador y comite tecnico
// Endpoints optimizados para alimentar charts en el frontend
@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // GET /api/estadisticas/bienestar/:atletaId?dias=30
  // Retorna serie temporal de RPE, calidad sueno, estado animico y dolencias
  @Get('bienestar/:atletaId')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  getBienestarAtleta(
    @Param('atletaId') atletaId: string,
    @Query('dias', new DefaultValuePipe(30), ParseIntPipe) dias: number,
    @CurrentUser() user: any,
  ) {
    return this.estadisticasService.getBienestarAtleta(
      BigInt(atletaId),
      BigInt(user.id),
      user.rol,
      dias,
    );
  }

  // GET /api/estadisticas/bienestar-grupal?dias=30
  // Retorna RPE promedio/max/min, calidad sueno y estado animico agregado de todos los atletas
  @Get('bienestar-grupal')
  @Roles('COMITE_TECNICO')
  getBienestarGrupal(
    @Query('dias', new DefaultValuePipe(30), ParseIntPipe) dias: number,
  ) {
    return this.estadisticasService.getBienestarGrupal(dias);
  }

  // GET /api/estadisticas/asistencia-grupal?semanas=8
  // Retorna asistencia semanal agregada de todos los atletas
  @Get('asistencia-grupal')
  @Roles('COMITE_TECNICO')
  getAsistenciaGrupal(
    @Query('semanas', new DefaultValuePipe(8), ParseIntPipe) semanas: number,
  ) {
    return this.estadisticasService.getAsistenciaGrupal(semanas);
  }

  // GET /api/estadisticas/carga-plan-vs-real/:atletaId?desde=&hasta=
  // Retorna comparacion de intensidad planificada vs alcanzada por sesion
  @Get('carga-plan-vs-real/:atletaId')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  getCargaPlanVsReal(
    @Param('atletaId') atletaId: string,
    @Query('desde') desde: string | undefined,
    @Query('hasta') hasta: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.estadisticasService.getCargaPlanVsReal(
      BigInt(atletaId),
      BigInt(user.id),
      user.rol,
      desde,
      hasta,
    );
  }
}
