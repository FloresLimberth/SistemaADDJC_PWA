import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RegistroPostEntrenamientoService } from './registro-post-entrenamiento.service';
import { CreateRegistroPostEntrenamientoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AtletaOwnershipGuard } from '../../common/guards/atleta-ownership.guard';

@Controller('registros-post-entrenamiento')
@UseGuards(JwtAuthGuard)
export class RegistroPostEntrenamientoController {
  constructor(
    private readonly registroPostEntrenamientoService: RegistroPostEntrenamientoService
  ) {}

  // POST /api/registros-post-entrenamiento - Crear registro (solo ENTRENADOR)
  // COMITE_TECNICO no puede crear porque el servicio requiere entrenadorId
  @Post()
  @Roles('ENTRENADOR')
  @UseGuards(RolesGuard, AtletaOwnershipGuard)
  create(@Body() createDto: CreateRegistroPostEntrenamientoDto, @CurrentUser() user: any) {
    // Pasar el userId, el servicio buscará el entrenadorId
    return this.registroPostEntrenamientoService.create(createDto, BigInt(user.id));
  }

  // GET /api/registros-post-entrenamiento - Listar registros
  @Get()
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findAll(
    @CurrentUser() user: any,
    @Query('atletaId') atletaId?: string,
    @Query('sesionId') sesionId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('asistio') asistio?: string,
    @Query('rpeMin', new ParseIntPipe({ optional: true })) rpeMin?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.registroPostEntrenamientoService.findAll(
      BigInt(user.id),
      user.rol,
      atletaId,
      sesionId,
      page,
      limit,
      fechaDesde,
      fechaHasta,
      asistio,
      rpeMin
    );
  }

  // GET /api/registros-post-entrenamiento/:id - Obtener registro por ID
  @Get(':id')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.registroPostEntrenamientoService.findOne(id, BigInt(user.id), user.rol);
  }

  // GET /api/sesiones/:sesionId/registros-post-entrenamiento - Ver registros de una sesion
  @Get('sesion/:sesionId')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findBySesion(@Param('sesionId') sesionId: string, @CurrentUser() user: any) {
    return this.registroPostEntrenamientoService.findBySesion(sesionId, BigInt(user.id), user.rol);
  }
}
