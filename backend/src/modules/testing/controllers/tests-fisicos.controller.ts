import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TestsFisicosService } from '../services/tests-fisicos.service';
import { CreateTestFisicoDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AtletaOwnershipGuard } from '../../../common/guards/atleta-ownership.guard';

@Controller('tests-fisicos')
@UseGuards(JwtAuthGuard)
export class TestsFisicosController {
  constructor(private readonly testsFisicosService: TestsFisicosService) {}

  // POST /api/tests-fisicos - Crear test fisico (solo ENTRENADOR)
  // COMITE_TECNICO no puede crear porque el servicio requiere entrenadorId
  @Post()
  @Roles('ENTRENADOR')
  @UseGuards(RolesGuard, AtletaOwnershipGuard)
  create(@Body() createDto: CreateTestFisicoDto, @CurrentUser() user: any) {
    // Pasar el userId, el servicio buscara el entrenadorId
    return this.testsFisicosService.create(createDto, BigInt(user.id));
  }

  // GET /api/tests-fisicos - Listar tests
  @Get()
  @Roles('ENTRENADOR', 'COMITE_TECNICO')
  @UseGuards(RolesGuard)
  findAll(
    @CurrentUser() user: any,
    @Query('atletaId') atletaId?: string,
    @Query('microcicloId') microcicloId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('asistio') asistio?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.testsFisicosService.findAll(
      BigInt(user.id),
      user.rol,
      atletaId,
      microcicloId,
      page,
      limit,
      fechaDesde,
      fechaHasta,
      asistio
    );
  }

  // GET /api/tests-fisicos/compare?test1=1&test2=5 - Comparar dos tests
  @Get('compare')
  @Roles('ENTRENADOR', 'COMITE_TECNICO')
  @UseGuards(RolesGuard)
  compareTests(
    @Query('test1') test1: string,
    @Query('test2') test2: string,
    @CurrentUser() user: any
  ) {
    if (!test1 || !test2) {
      throw new Error('Los parametros test1 y test2 son requeridos');
    }

    return this.testsFisicosService.compareTests(test1, test2, BigInt(user.id), user.rol);
  }

  // GET /api/atletas/:atletaId/tests/latest?tipoTest=pressBanca - Ultimo test por tipo
  @Get('atleta/:atletaId/latest')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findLatestByType(
    @Param('atletaId') atletaId: string,
    @Query('tipoTest') tipoTest: string,
    @CurrentUser() user: any
  ) {
    if (!tipoTest) {
      throw new Error('El parametro tipoTest es requerido');
    }

    return this.testsFisicosService.findLatestByType(atletaId, tipoTest, BigInt(user.id), user.rol);
  }

  // GET /api/atletas/:atletaId/tests/estadisticas?tipoTest=pressBanca - Estadisticas
  @Get('atleta/:atletaId/estadisticas')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  getStatistics(
    @Param('atletaId') atletaId: string,
    @Query('tipoTest') tipoTest: string,
    @CurrentUser() user: any
  ) {
    if (!tipoTest) {
      throw new Error('El parametro tipoTest es requerido');
    }

    return this.testsFisicosService.getStatistics(atletaId, tipoTest, BigInt(user.id), user.rol);
  }

  // GET /api/atletas/:atletaId/tests/evolution?tipoTest=navette - Evolucion temporal
  @Get('atleta/:atletaId/evolution')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  getEvolution(
    @Param('atletaId') atletaId: string,
    @Query('tipoTest') tipoTest: string,
    @CurrentUser() user: any
  ) {
    if (!tipoTest) {
      throw new Error('El parametro tipoTest es requerido');
    }

    return this.testsFisicosService.getEvolution(atletaId, tipoTest, BigInt(user.id), user.rol);
  }

  // GET /api/atletas/:atletaId/tests - Tests de un atleta
  @Get('atleta/:atletaId')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findByAtleta(@Param('atletaId') atletaId: string, @CurrentUser() user: any) {
    return this.testsFisicosService.findByAtleta(atletaId, BigInt(user.id), user.rol);
  }

  // GET /api/tests-fisicos/me - Obtener tests del atleta autenticado (solo ATLETA)
  @Get('me')
  @Roles('ATLETA')
  @UseGuards(RolesGuard)
  findMyTests(@CurrentUser() user: any) {
    return this.testsFisicosService.findMyTests(BigInt(user.id), user.rol);
  }

  // GET /api/tests-fisicos/:id - Obtener test por ID
  @Get(':id')
  @Roles('ENTRENADOR', 'COMITE_TECNICO', 'ATLETA')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.testsFisicosService.findOne(id, BigInt(user.id), user.rol);
  }
}
