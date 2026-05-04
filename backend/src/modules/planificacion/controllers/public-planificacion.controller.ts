import { Controller, Get, UseGuards } from '@nestjs/common';
import { PublicPlanificacionService } from '../services/public-planificacion.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

// Controller para datos publicos de planificacion (landing page)
// Solo expone datos minimos: nombre y etapa de mesociclos
// No requiere autenticacion
@Controller('public/planificacion')
@UseGuards(JwtAuthGuard)
export class PublicPlanificacionController {
  constructor(
    private readonly publicPlanificacionService: PublicPlanificacionService,
  ) {}

  // GET /api/public/planificacion - Datos publicos del calendario
  // Retorna el macrociclo activo con sus mesociclos (nombre + etapa + fechas)
  // Sin datos de atletas, sesiones, ni microciclos
  @Public()
  @Get()
  async obtenerPlanificacionPublica() {
    return this.publicPlanificacionService.obtenerPlanificacionPublica();
  }
}
