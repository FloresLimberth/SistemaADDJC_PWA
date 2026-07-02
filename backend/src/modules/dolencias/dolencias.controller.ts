import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { DolenciasService } from './dolencias.service';
import { CreateDolenciaDto, MarcarRecuperadoDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dolencias')
@UseGuards(JwtAuthGuard)
export class DolenciasController {
  constructor(private readonly dolenciasService: DolenciasService) {}

  // POST /api/dolencias - Crear dolencia (ENTRENADOR, COMITE_TECNICO)
  @Post()
  @Roles('ENTRENADOR', 'COMITE_TECNICO')
  @UseGuards(RolesGuard)
  create(@Body() createDto: CreateDolenciaDto) {
    return this.dolenciasService.create(createDto);
  }

  // GET /api/dolencias - Listar dolencias
  @Get()
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findAll(
    @CurrentUser() user: any,
    @Query('atletaId') atletaId?: string,
    @Query('recuperado', new ParseBoolPipe({ optional: true }))
    recuperado?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.dolenciasService.findAll(
      BigInt(user.id),
      user.rol,
      atletaId,
      recuperado,
      page,
      limit
    );
  }

  // GET /api/dolencias/:id - Obtener dolencia por ID
  @Get(':id')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dolenciasService.findOne(id, BigInt(user.id), user.rol);
  }

  // GET /api/atletas/:atletaId/dolencias/activas - Dolencias activas de un atleta
  @Get('atleta/:atletaId/activas')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findActiveByAtleta(@Param('atletaId') atletaId: string, @CurrentUser() user: any) {
    return this.dolenciasService.findActiveByAtleta(atletaId, BigInt(user.id), user.rol);
  }

  // PATCH /api/dolencias/:id/marcar-recuperado - Marcar como recuperado (ENTRENADOR, COMITE_TECNICO)
  @Patch(':id/marcar-recuperado')
  @Roles('ENTRENADOR', 'COMITE_TECNICO')
  @UseGuards(RolesGuard)
  marcarRecuperado(
    @Param('id') id: string,
    @Body() dto: MarcarRecuperadoDto,
    @CurrentUser() user: any
  ) {
    // Pasar el userId, el servicio buscará el entrenadorId
    return this.dolenciasService.marcarComoRecuperado(id, BigInt(user.id), dto);
  }
}
