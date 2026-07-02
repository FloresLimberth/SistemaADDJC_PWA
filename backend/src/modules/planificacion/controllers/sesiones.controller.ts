import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SesionesService } from '../services/sesiones.service';
import {
  CreateSesionDto,
  UpdateSesionDto,
  UpdateEjerciciosSesionDto,
  UpdateEjerciciosSesionSimpleDto,
} from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('sesiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  // POST /api/sesiones - Crear sesión (COMITE_TECNICO y ENTRENADOR)
  @Post()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  create(@Body() createSesionDto: CreateSesionDto) {
    return this.sesionesService.create(createSesionDto);
  }

  // GET /api/sesiones - Listar sesiones (filtradas por rol)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findAll(
    @CurrentUser() user: any,
    @Query('microcicloId') microcicloId?: string,
    @Query('fecha') fecha?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.sesionesService.findAll(
      BigInt(user.id),
      user.rol,
      microcicloId,
      fecha,
      page,
      limit
    );
  }

  // GET /api/sesiones/by-atleta/:atletaId - Obtener sesiones de microciclos asignados a un atleta
  // Usado para filtrar sesiones al registrar post-entrenamiento o test fisico
  // Query param tipoSesion: Filtro opcional (ej: TEST o ENTRENAMIENTO,RECUPERACION,COMPETENCIA)
  @Get('by-atleta/:atletaId')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  findByAtleta(
    @Param('atletaId') atletaId: string,
    @Query('tipoSesion') tipoSesion: string | undefined,
    @CurrentUser() user: any
  ) {
    return this.sesionesService.findByAtleta(atletaId, BigInt(user.id), user.rol, tipoSesion);
  }

  // GET /api/sesiones/:id - Obtener sesión por ID (validando ownership)
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sesionesService.findOne(id, BigInt(user.id), user.rol);
  }

  // PATCH /api/sesiones/:id - Actualizar sesión (COMITE_TECNICO y ENTRENADOR)
  @Patch(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  update(@Param('id') id: string, @Body() updateSesionDto: UpdateSesionDto) {
    return this.sesionesService.update(id, updateSesionDto);
  }

  // GET /api/sesiones/:id/ejercicios - Obtener ejercicios de una sesion
  // Retorna tanto los campos de texto como los ejercicios relacionales
  @Get(':id/ejercicios')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  getEjercicios(@Param('id') id: string) {
    return this.sesionesService.getEjerciciosSesion(id);
  }

  // PATCH /api/sesiones/:id/ejercicios - Actualizar ejercicios de una sesion (formato completo)
  // Recibe lista de ejercicios con IDs del catalogo y metadatos opcionales
  // Valida IDs, actualiza ejercicios_sesion y regenera campos de texto automaticamente
  @Patch(':id/ejercicios')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  updateEjercicios(@Param('id') id: string, @Body() dto: UpdateEjerciciosSesionDto) {
    return this.sesionesService.updateEjerciciosSesion(id, dto);
  }

  // PATCH /api/sesiones/:id/ejercicios-simple - Actualizar ejercicios (formato simplificado)
  // Recibe IDs agrupados por tipo, asigna orden automaticamente
  // Util para interfaces donde se seleccionan ejercicios por categoria
  @Patch(':id/ejercicios-simple')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  updateEjerciciosSimple(@Param('id') id: string, @Body() dto: UpdateEjerciciosSesionSimpleDto) {
    return this.sesionesService.updateEjerciciosSesionSimple(id, dto);
  }

  // DELETE /api/sesiones/:id - Eliminar sesión (COMITE_TECNICO y ENTRENADOR) - HARD DELETE
  @Delete(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }
}
